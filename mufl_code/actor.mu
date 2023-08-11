application actor loads libraries
    current_transaction_info,
    identity_proof_document,
    attestation_document,
    browser_attestation_document,
    transaction_message_decoder
    uses transactions
{

    metadef message_t: ($data -> str, $chat_id -> global_id).
    metadef member_t: ($member_id -> global_id, $key -> hash_code).
    metadef chat_t: ($chat_id -> global_id, $members -> member_t(,)).
    metadef invite_t: ($chat_id -> global_id, $inviter -> global_id).

    hidden
    {
        chats is chat_t(,) = (,).

        validate_chat_id = fn (chat_id: global_id)
        {
            abort "Chat not found wih chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when not chats chat_id.
        }

        validate_chat_not_registered = fn (chat_id: global_id)
        {
            abort "Chat already registered with chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when chats chat_id.
        }
    }

    // ---------------------------------------------
    //                 Chat creation
    // ---------------------------------------------

    trn create_chat member_list: global_id(,)
    {
        chat_id = _new_id "create new chat".
        members is member_t(,) = (,).
        scan member_list bind member do
            // this is a placeholder for real cryptography
            key = _new_id "Create a key".
            members member -> key.
        end
        chat is chat_t(,) = ($chat_id -> chat_id, $members -> members).

        send_array is ?::transaction::action::send/product/product[] = [].
        scan member_list bind member_id do
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::enter_chat", $targ -> chat).
        end
        return transaction::success send_array.
    }

    // ---------------------------------------------
    //                 Invitations
    // ---------------------------------------------

    trn invite chat_id: global_id
    {
        requestor = current_transaction_info::get_external_envelope_or_abort() $from.
        validate_chat_id chat_id.

        send_array is ?::transaction::action::send/product/product[] = [].
        scan chat chat_id $members bind member_id do
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::add_member", $targ -> ($chat_id -> chat_id, $member_id -> requestor)).
        end

        return transaction::success [
            send_array,
            transaction::action::send requestor ($name -> "::actor::enter_chat", $targ -> chat)
        ].
    }

    trn add_member _:
    ($chat_id -> chat_id: global_id, $member_id -> member_id: global_id)
    {
        validate_chat_id chat_id.
        // this is a placeholder for real cryptography
        key = _new_id "Create a key".
        chats $chat_id $members member_id -> key.
        return transaction::success 
            // here might be a kety exchange logic []
        .
    }

    trn enter_chat chat: chat_t
    {
        validate_chat_not_registered chat chat_id.
        chats chat_id -> chat.
        return transaction::success.
    }

    trn join_chat invite: invite_t
    {
        return transaction::success [
            transaction::action::send invite $inviter
                ($name -> "::actor::invite", $targ -> invite $chat_id)
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

        send_array is ?::transaction::action::send/product/product[] = [].
        scan members bind member_id do
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::receive_message", $targ -> message).
        end
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
            transaction::action::return_data ("Received a message: " + (message $data) + ", from a packet: " + sender_id + ", chat id: " + (message $chat_id))
        ].
    }
}
