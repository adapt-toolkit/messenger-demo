import React, { useEffect, useState } from 'react';
import './App.css';
import {adapt_wrapper_browser, adapt_js_api, adapt_wrappers, adapt_js_api_utils} from "adapt_utilities"

// import {adapt_wrapper_browser} from 'adapt_executables'
// import { AdaptValue } from 'isomorphic_addon';
// import { AdaptPacketWrapper } from 'adapt_wrappers'
// import { object_to_adapt_value } from "addon_wrapper"


const App: React.FC = () => {
    const [packetId, setPacketId] = useState<string>('ADAPT_PACKET_ID'); // Placeholder value
    const [recipientId, setRecipientId] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [notification, setNotification] = useState<string>('');

    const [adaptWrapper, setAdaptWrapper] = useState<adapt_wrappers.AdaptPacketWrapper | undefined>()

    const onButtonClick = () => {
        // Handle button click here

        if (!adaptWrapper) {
            makeNotification("Internal error: ADAPT packet is not initialized.");
            return;
        }

        const trn = adapt_js_api_utils.object_to_adapt_value({
            name: "::user::send_message",
            targ: {
                packet_id: recipientId,
                data: message
            }
        });

        const packet = adaptWrapper.add_client_message(trn);
    }

    const makeNotification = (text: string) => {
        setNotification(text);
    }

    useEffect(() => {
        const urlSearch = window.location.search;
		const urlParams = new URLSearchParams(urlSearch);
        const seed_phrase = urlParams.get('seed');
        const args = `--broker_address ws://localhost:1111 --logger_config --level ERROR --logger_config_end --packet --unit_hash 78093A917684DD79B78E918FD5AC658C747D958AB3C13D4DD0D037B57A9DB46D --unit_dir_path /static/mufl/ --seed_phrase ${seed_phrase}`;
        adapt_wrapper_browser.start(args.split(" ")).then(adapt_wrapper => {
            adapt_wrapper.on_packet_created_cb = (packet_id, wrapper) => {
                setAdaptWrapper(wrapper);
                setPacketId(packet_id);

                wrapper.on_return_data = (data: adapt_js_api.AdaptValue) => {
                    const message = data.Visualize();
                    makeNotification(message);
                }
            }
        })

        // This function is invoked once when the component is mounted
        // Use this function to initialize the things you need
    }, []);

    return (
        <div className="container">
            <p>Your packet ID is: {packetId}</p>
            <input
                type="text"
                placeholder="Recipient ID"
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={e => setMessage(e.target.value)}
            />
            <button onClick={onButtonClick}>
                Send Message
            </button>
            {notification && <div className="notification">{notification}</div>}
        </div>
    )
}

export default App;
