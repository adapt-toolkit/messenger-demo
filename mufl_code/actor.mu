application actor loads libraries
    current_transaction_info,
    identity_proof_document,
    attestation_document,
    browser_attestation_document,
    transaction_message_decoder,
    address_document,
    address_document_types,
    key_utils,
    key_storage
    uses transactions
{
    using key_utils.
    using address_document.

    hidden
    {
        metadef message_t: ($data -> str, $chat_id -> global_id).
        metadef member_t: ($name -> str, $address_document -> address_document_types::t_address_document).
        metadef contacts_t: (global_id ->> member_t).
        metadef chat_t: ($chat_id -> global_id, $chat_name -> str, $members -> global_id(,)).
        metadef invite_t: ($id -> global_id, $inviter -> address_document_types::t_address_document, $key -> publickey_encrypt).
        module callback_t 
        { 
            new_chat = $new_chat. 
            invite_envelope = $invite_envelope. 
            new_message = $new_message. 
            set_user_name = $set_user_name.
        }

        _read = grab( _read ).
        key_storage::init ($_read -> _read).


        user_name is str = "".
        chats   is (global_id ->> chat_t)   = (,).
        contacts is contacts_t = (,).
        invites is (global_id ->> ($secret_key -> secretkey_encrypt, $chat_id -> global_id)) = (,).

        fn validate_chat_id (chat_id: global_id) -> chat_t
        {
            chat = chats chat_id abort "Chat not found wih chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when is NIL.
            return chat?.
        }

        fn validate_chat_not_registered (chat_id: global_id)
        {
            abort "Chat already registered with chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when chats chat_id.
        }

        fn validate_invite (invite_id: global_id) -> ($secret_key -> secretkey_encrypt, $chat_id -> global_id)
        {
            invite = invites invite_id abort "Invite not found with invite_id [" + invite_id + "] for actor " + _get_container_id() + "!" when is NIL.
            return invite?.
        }

        fn create_invite (chat_id: global_id) -> invite_t
        {
            // generate cryptographic keys for the invite message communication
            crypto_scheme = _crypto_default_scheme_id(). 
            keypair = _crypto_construct_encryption_keypair crypto_scheme.


            invite_id = _new_id ("invite to chat: " + chat_id).
            invite is invite_t = ($id -> invite_id, $inviter -> get_my_address_document(), $key -> (keypair $public_key)).
            invites invite_id -> ($invite -> invite, $secret_key -> (keypair $secret_key), $chat_id -> chat_id).

            return invite.
        }
    }

    // ---------------------------------------------
    //                 User initialization
    // ---------------------------------------------
    trn set_user_name user_name: str
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).
        ::actor::user_name -> user_name.
        contacts _get_container_id() -> ($name -> user_name, $address_document -> get_my_address_document()).
        return transaction::success [
            ::transaction::action::return_data ($user_name -> user_name, $type -> callback_t::set_user_name)
        ].
    }

    // ---------------------------------------------
    //                 Chat creation
    // ---------------------------------------------

    trn create_chat _:($chat_name -> chat_name: str)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).
        chat_id = _new_id ("create new chat: " + chat_name).
        chat = ($chat_id -> chat_id, $chat_name -> chat_name, $members -> (_get_container_id(),)).
        chats chat_id -> chat.

        return transaction::success [
            transaction::action::return_data ($chat -> chat, $type -> callback_t::new_chat)
        ].
    }

    // ---------------------------------------------
    //                 Invitations
    // ---------------------------------------------

    trn invite _: ($invite_id -> invite_id: global_id, $docs -> member_document_encrypted: crypto_message, $invitee_key -> signing_key: publickey_encrypt)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
        // get the invite cryptographic keys
        validate_invite invite_id => ($secret_key -> decryption_key, $chat_id -> chat_id).

        // decrypt the members address document
        decrypted_docs = _crypto_decrypt_message decryption_key signing_key member_document_encrypted.
        member = (_read decrypted_docs) safe member_t.
        member_address_document = member $address_document.

        // check that the user sending the request is the one whose document is encrypted in the request
        requestor = current_transaction_info::get_external_envelope_or_abort() $from.
        abort "The user sending the request is not the one whose document is encrypted in the request!"
            when requestor != member_address_document $identity $container_id.

        // request other chat members to add the user to their member lists
        chat = validate_chat_id chat_id.
        contacts_info is contacts_t = (,).
        send_array is transaction::action::type[] = [].
        sc chat $members -- (member_id->)
        {
            // find contact info for a given member
            contacts_info member_id -> (contacts member_id).
        
            // encrypt the message
            encrypted_trn = transaction::encrypt (
                $cid           -> member_id,
                $trn           -> ($name -> "::actor::add_member", $targ -> ($chat_id -> chat_id, $member -> member)),
                $isemsignature -> TRUE
            ).
            send_array (_count send_array|) -> transaction::action::send member_id encrypted_trn.
        }

        process_address_document member_address_document TRUE.


        _print chat " \n\n" contacts_info " \n\n".
        // add the requestor to the chat
        encrypted_trn = transaction::encrypt (
            $cid -> requestor,
            $trn -> ($name -> "::actor::enter_chat", $targ -> ($chat -> chat, $contacts_info -> contacts_info)),
            $isemsignature -> TRUE
        ).
        send_array (_count send_array|) -> transaction::action::send requestor encrypted_trn.

        return transaction::success send_array.
    }

    trn add_member _:
    ($chat_id -> chat_id: global_id, $member -> member: member_t)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
        abort "Transaction is expected to be encrypted!" when not current_transaction_info::is_encrypted().
        abort "Transaction is expected to be singed!" when not current_transaction_info::is_signed().

        validate_chat_id chat_id.

        // register the new member
        process_address_document (member $address_document) TRUE.
        member_id = member $address_document $identity $container_id.
        chats chat_id $members member_id -> TRUE.
        contacts member_id -> member.
        return transaction::success [].
    }

    // actually joining chat
    trn enter_chat _:($chat -> chat: chat_t, $contacts_info -> contacts_info: contacts_t)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
        abort "Transaction is expected to be encrypted!" when not current_transaction_info::is_encrypted().
        abort "Transaction is expected to be singed!" when not current_transaction_info::is_signed().

        chat_id = chat $chat_id.
        validate_chat_not_registered chat_id.

        // register other members' documents
        sc chat $members -- (member_id->)
        {
            contact_info = contacts_info member_id.
            ad = contact_info $address_document.
            contacts member_id -> contact_info.
            process_address_document ad TRUE.
        }

        // add myself to the chat member registry
        chat $members _get_container_id() -> TRUE.
        chats chat_id -> chat.
        return transaction::success [
            transaction::action::return_data ($chat -> chat, $type -> callback_t::new_chat)
        ].
    }

    trn join_chat invite_link: bin
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).

        invite = (_read invite_link) safe invite_t.
        my_document = get_my_address_document().
        process_address_document (invite $inviter) TRUE. 

        // generate cryptographic keys to encrypt the invite message
        crypto_scheme = _crypto_default_scheme_id(). 
        keypair = _crypto_construct_encryption_keypair crypto_scheme.

        // encrypt the invitation letter
        encryption_key = invite $key.
        invite_id = invite $id.
        encrypted_message = _crypto_encrypt_message (keypair $secret_key) encryption_key (_write ($address_document -> my_document, $name -> user_name)).

        return transaction::success [
            transaction::action::send (invite $inviter $identity $container_id)
                ($name -> "::actor::invite", $targ -> ($invite_id -> invite_id, $docs -> encrypted_message, $invitee_key -> (keypair $public_key)))
        ].
    }

    trn generate_invite chat_id: global_id
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).

        validate_chat_id chat_id.

        invite = create_invite chat_id.
        
        return transaction::success [
            transaction::action::return_data ($chat_id -> chat_id, $invite -> (_write invite), $type -> callback_t::invite_envelope)
        ].
    }

    // ---------------------------------------------
    //                 Messaging
    // ---------------------------------------------

    trn send_message _:($message -> message: message_t, $timestamp -> timestamp: time)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).

        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).
    
        // extract recipient ids from the transaction argument
        members = chats (message $chat_id) $members.

        send_array is transaction::action::type[] = [].
        sc members -- (member_id->)
        {
            // encrypt the message
            encrypted_trn = transaction::encrypt (
                $cid           -> member_id,
                $trn           -> ($name -> "::actor::receive_message", $targ -> ($message -> message, $timestamp -> timestamp)),
                $isemsignature -> TRUE
            ).
            send_array (_count send_array|) -> transaction::action::send member_id encrypted_trn.
        }
        
        return transaction::success send_array.
    }
    
    trn receive_message _:($message -> message: message_t, $timestamp -> timestamp: time)
    {
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
        abort "Transaction is expected to be encrypted!" when not current_transaction_info::is_encrypted().
        abort "Transaction is expected to be singed!" when not current_transaction_info::is_signed().
        
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
    
        // extract the sender's packet ID from the transaction envelope
        envelope = current_transaction_info::get_external_envelope_or_abort().
        sender_id = envelope $from. // envelope is of 'record' type, use reduction to extract the $from field

        sender = contacts sender_id abort "Internal error: the sender is not in the list of known contacts!" when is NIL.
        sender_name = sender? $name.
        

        return transaction::success [
            transaction::action::return_data (
                $message -> message,
                $sender_id -> sender_id,
                $sender_name -> sender_name,
                $timestamp -> timestamp,
                $type -> callback_t::new_message
            )
        ].
    }
}
