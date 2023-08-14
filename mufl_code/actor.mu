application actor loads libraries
    current_transaction_info,
    identity_proof_document,
    attestation_document,
    browser_attestation_document,
    transaction_message_decoder
    uses transactions
{


    hidden
    {
        metadef message_t: ($data -> str, $chat_id -> global_id).
        metadef member_t: global_id.
        metadef chat_t: ($chat_id -> global_id, $chat_name -> str, $members -> member_t(,)).
        metadef invite_t: ($chat_id -> global_id, $inviter -> global_id).
        module callback_t { new_chat = $new_chat. invite_envelope = $invite_envelope. }

        _read = grab( _read ).

        chats is (global_id ->> chat_t) = (,).

        validate_chat_id = fn (chat_id: global_id) : chat_t
        {
            chat = chats chat_id abort "Chat not found wih chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when is NIL.
            return chat?.
        }

        validate_chat_not_registered = fn (chat_id: global_id)
        {
            abort "Chat already registered with chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when chats chat_id.
        }
    }

    // ---------------------------------------------
    //                 Chat creation
    // ---------------------------------------------

    trn create_chat _:($chat_name -> chat_name: str, $member_list -> member_list: member_t(,))
    {
        chat_id = _new_id "create new chat".
        chat = ($chat_id -> chat_id, $chat_name -> chat_name, $members -> member_list).

        send_array is transaction::action::type[] = [].
        sc member_list -- (member_id->)
        {
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::enter_chat", $targ -> chat).
        }

        send_array (_count send_array|) -> transaction::action::return_data ($chat -> chat, $type -> callback_t::new_chat).
        return transaction::success send_array.
    }

    // ---------------------------------------------
    //                 Invitations
    // ---------------------------------------------

    trn invite chat_id: global_id
    {
        requestor = current_transaction_info::get_external_envelope_or_abort() $from.
        chat = validate_chat_id chat_id.

        send_array is transaction::action::type[] = [].
        sc chat $members -- (member_id->)
        {
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::add_member", $targ -> ($chat_id -> chat_id, $member_id -> requestor)).
        }

        send_array (_count send_array|) -> transaction::action::send requestor ($name -> "::actor::enter_chat", $targ -> chat).
        return transaction::success send_array.
    }

    trn add_member _:
    ($chat_id -> chat_id: global_id, $member_id -> member_id: global_id)
    {
        validate_chat_id chat_id.
        // this is a placeholder for real cryptography
        //key = _new_id "Create a key".
        chats chat_id $members member_id -> TRUE.
        return transaction::success []
            // here might be a kety exchange logic []
        .
    }

    // actually joining chat
    trn enter_chat chat: chat_t
    {
        chat_id = chat $chat_id.
        validate_chat_not_registered chat_id.
        chats chat_id -> chat.
        return transaction::success [
            transaction::action::return_data ($chat -> chat, $type -> callback_t::new_chat)
        ].
    }

    trn join_chat invite_link: bin
    {
        invite = (_read invite_link) safe invite_t.
        return transaction::success [
            transaction::action::send (invite $inviter) ($name -> "::actor::invite", $targ -> invite $chat_id)
        ].
    }

    trn ro generate_invite chat_id: global_id
    {
        validate_chat_id chat_id.
        invite = _write ($chat_id -> chat_id, $inviter -> _get_container_id ()).
        return transaction::success [
            transaction::action::return_data ($invite -> invite, $type -> callback_t::invite_envelope)
        ].
    }

    // ---------------------------------------------
    //                 Messaging
    // ---------------------------------------------

    trn send_message message: message_t
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).
    
        // extract recipient ids from the transaction argument
        members = chats (message $chat_id) $members.

        send_array is transaction::action::type[] = [].
        sc members -- (member_id->)
        {
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::receive_message", $targ -> message).
        }
        return transaction::success send_array.
    }
    
    trn receive_message message: message_t
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
    
        // extract the sender's packet ID from the transaction envelope
        envelope = current_transaction_info::get_external_envelope_or_abort ().
        sender_id = envelope $from. // envelope is of 'record' type, use reduction to extract the $from field

        return transaction::success [
            transaction::action::return_data ($data -> (message $data), $sender_id -> sender_id, $chat_id -> (message $chat_id))
        ].
    }
}
