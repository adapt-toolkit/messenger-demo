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
        module callback_t { new_chat = $new_chat. invite_envelope = $invite_envelope. new_message = $new_message. }

        _read = grab( _read ).

        chats is (global_id ->> chat_t) = (,).

        validate_chat_id = func takes chat_id: global_id returns chat_t does
        {
            chat = chats chat_id abort "Chat not found wih chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when is NIL.
            return chat?.
        }

        validate_chat_not_registered = func takes chat_id: global_id does
        {
            abort "Chat already registered with chat_id [" + chat_id + "] for actor " + _get_container_id() + "!" when chats chat_id.
        }
    }

    // ---------------------------------------------
    //                 Chat creation
    // ---------------------------------------------

    deftrans create_chat (,) takes _:($chat_name -> chat_name: str) does
    {
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

    deftrans invite (,) takes chat_id: global_id does
    {
        requestor = current_transaction_info::get_external_envelope_or_abort() $from.
        chat = validate_chat_id chat_id.

        send_array is transaction::action::type[] = [].
        scan chat $members bind member_id do
        {
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::add_member", $targ -> ($chat_id -> chat_id, $member_id -> requestor)).
        }
        end

        send_array (_count send_array|) -> transaction::action::send requestor ($name -> "::actor::enter_chat", $targ -> chat).
        return transaction::success send_array.
    }

    deftrans add_member (,) takes _:
    ($chat_id -> chat_id: global_id, $member_id -> member_id: global_id)
    does {
        validate_chat_id chat_id.
        // this is a placeholder for real cryptography
        //key = _new_id "Create a key".
        chats chat_id $members member_id -> TRUE.
        return transaction::success []
            // here might be a kety exchange logic []
        .
    }

    // actually joining chat
    deftrans enter_chat (,) takes chat: chat_t does
    {
        chat_id = chat $chat_id.
        validate_chat_not_registered chat_id.
        chat $members _get_container_id() -> TRUE.
        chats chat_id -> chat.
        return transaction::success [
            transaction::action::return_data ($chat -> chat, $type -> callback_t::new_chat)
        ].
    }

    deftrans join_chat (,) takes invite_link: bin does
    {
        invite = (_read invite_link) safe invite_t.
        return transaction::success [
            transaction::action::send (invite $inviter) ($name -> "::actor::invite", $targ -> invite $chat_id)
        ].
    }

    deftrans generate_invite ($readonly->1,) takes chat_id: global_id does
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

    deftrans send_message (,) takes message: message_t does
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).
    
        // extract recipient ids from the transaction argument
        members = chats (message $chat_id) $members.

        send_array is transaction::action::type[] = [].
        scan members bind member_id do
        {
            send_array (_count send_array|) -> transaction::action::send member_id
                ($name -> "::actor::receive_message", $targ -> message).
        }
        end
        
        return transaction::success send_array.
    }
    
    deftrans receive_message (,) takes message: message_t does
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
    
        // extract the sender's packet ID from the transaction envelope
        envelope = current_transaction_info::get_external_envelope_or_abort().
        sender_id = envelope $from. // envelope is of 'record' type, use reduction to extract the $from field
        timestamp = _parse_time "2023-01-01 00:00:00 (UTC)".

        return transaction::success [
            transaction::action::return_data ($message -> message, $sender_id -> sender_id, $timestamp -> timestamp, $type -> callback_t::new_message)
        ].
    }
}
