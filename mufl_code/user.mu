application user loads libraries
  identity_proof_document,
  attestation_document,
  browser_attestation_document
uses transactions
{

    metadef message_type: ($data -> str, $packet_id -> global_id).

    deftrans send_message (,) takes message: message_type does
    {
        recipient = message $packet_id. // ID of the packet we want to send the message to
        return ::transaction::success [
            ::transaction::action::send recipient ($name -> "::user::receive_message", $targ -> ($data -> (message $data), $packet_id -> (_get_container_id())))
        ].
    }

    deftrans receive_message (,) takes message: message_type does
    {
        return ::transaction::success [
          ::transaction::action::return_data ("Received a message: " + (message $data) + ", from a packet: " + (message $packet_id))
        ].
    }
}
