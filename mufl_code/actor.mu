application actor loads libraries
    current_transaction_info,
    identity_proof_document,
    attestation_document,
    browser_attestation_document,
    transaction_message_decoder
    uses transactions
{

    metadef message_type: ($data -> str, $packet_id -> global_id).

    deftrans send_message (,) takes message: message_type does
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::user,).

        // extract recipient packet id from the transaction argument
        recipient_id = message $packet_id. 

        // extract the message text
        text = message $data.

        return transaction::success [
            transaction::action::send recipient_id (
                $name -> "::actor::receive_message", // specify the name of the transaction that should be invoked in the recipient's packet
                $targ -> text // pass an argument
            )
        ].
    }

    deftrans receive_message (,) takes message: str does
    {
        // validate the transaction's origin
        current_transaction_info::validate_origin_or_abort (transaction::envelope::origin::external,).
    
        // extract the sender's packet ID from the transaction envelope
        envelope = current_transaction_info::get_external_envelope_or_abort ().
        sender_id = envelope $from. // envelope is of 'record' type, use reduction to extract the $from field

        return transaction::success [
            transaction::action::return_data ("Received a message: " + message + ", from a packet: " + sender_id)
        ].
    }
}
