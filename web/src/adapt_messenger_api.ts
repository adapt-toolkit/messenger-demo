import { adapt_js_api, adapt_js_api_utils, adapt_wrapper_browser, adapt_wrappers } from "adapt_utilities"
import { copyToClipboard } from './utils';


export module adapt_messenger_api {

    // hardcoded demo configuration
    const broker_address = "ws://127.0.0.1:9001"
    const code_id = "DC11CD1488BBAB536F65B1E68FFF0BE5D93EA623CC0D9510DD89BF56C1205656" 
    const test_mode = true;

    export class AdaptMessengerAPI {

        private __on_chat_created_cb?: (chat_id: string, chat_name: string) => void;
        private __on_message_received_cb?: (chat_id: string, message: string, timestamp: string, from: string, incoming: boolean) => void;

        constructor(public packet: adapt_wrappers.AdaptPacketWrapper) {
            packet.on_return_data = (data: adapt_js_api.AdaptValue) => {
                const type = data.Reduce('type').Visualize();
                if (type === 'new_chat') {
                    if (this.__on_chat_created_cb) {
                        const chat = data.Reduce('chat');
                        const chat_id = chat.Reduce('chat_id').Visualize();
                        const chat_name = chat.Reduce('chat_name').Visualize();
                        this.__on_chat_created_cb(chat_id, chat_name);
                    }
                }
                else if (type === 'invite_envelope') {
                    const invite = data.Reduce('invite').GetBinary().toString('hex');
                    copyToClipboard(invite);   
                }
                else if (type === 'new_message') {
                    if (this.__on_message_received_cb) {
                        const message = data.Reduce('message').Reduce('data').Visualize();
                        const chat_id = data.Reduce('message').Reduce('chat_id').Visualize();
                        const timestamp = data.Reduce('timestamp').Visualize();
                        const sender_id = data.Reduce('sender_id');
                        const incoming = sender_id.Visualize() !== this.packet.packet.GetContainerID().Visualize();

                        this.__on_message_received_cb(chat_id, message, timestamp, sender_id.Visualize(), incoming);
                    }
                }
                else {
                    this.packet.logger.error("Unrecognized data returned from the transaction!");
                }
            }
        }


        send_message = (message: string, chat_id: string) => {
            const timestamp = adapt_js_api.AdaptEnvironment.SystemTime(undefined);
            const trn = adapt_js_api_utils.object_to_adapt_value({
                name: "::actor::send_message",
                targ: {
                    message: {
                        chat_id: chat_id,
                        data: message
                    },
                    timestamp: timestamp
                }
            }
            )

            timestamp.Destroy();

            this.packet.add_client_message(trn);
        }

        create_chat = (chat_name: string) => {
            const trn = adapt_js_api_utils.object_to_adapt_value({
                name: "::actor::create_chat",
                targ: {
                    chat_name: chat_name
                }
            });
            this.packet.add_client_message(trn);
        }

        connect_to_chat = (invite: string) => {
            const trn = adapt_js_api_utils.object_to_adapt_value({
                name: "::actor::join_chat",
                targ: this.packet.packet.NewBinaryFromHex(invite)
            })

            this.packet.add_client_message(trn);
        }

        generate_invite = (chat_id: string) => {
            const trn = adapt_js_api_utils.object_to_adapt_value({
                name: "::actor::generate_invite",
                targ: chat_id
            })


            this.packet.add_client_message(trn);
        }

        set on_chat_created(on_chat_created_cb: (chat_id: string, chat_name: string) => void) {
            this.__on_chat_created_cb = on_chat_created_cb;
        }

        set on_message_received(on_message_received_cb: (chat_id: string, message: string, timestamp: string, from: string, incoming: boolean) => void) {
            this.__on_message_received_cb = on_message_received_cb;
        }


    }

    export const initialize = async (seed_phrase: string, on_initialized: (adapt_messenger_api: AdaptMessengerAPI) => void): Promise<void> => {
        const wrapper = await adapt_wrapper_browser.start(`${test_mode ? "--test_mode --broker_address" : "--broker_address"} ${broker_address} --logger_config --level ERROR --logger_config_end --packet --unit_hash ${code_id} --unit_dir_path /static/mufl/ --seed_phrase ${seed_phrase}`.split(' '))

        const packet = adapt_js_api.AdaptEnvironment.EmptyPacket(undefined, false);
        const result = packet.ExecuteFunction("_is_test_mode", [false]);
        console.log("Running in test mode: ", result.Visualize());
        wrapper.on_packet_created_cb = (_, wrapper) => {
            on_initialized(new AdaptMessengerAPI(wrapper));
        }
    }

}
