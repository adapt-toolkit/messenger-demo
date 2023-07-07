import React, { useEffect, useState } from 'react';
import './App.css';
import {adapt_wrapper_browser, adapt_js_api, adapt_wrappers, adapt_js_api_utils} from "adapt_utilities"


const App: React.FC = () => {

    // Use the useState pattern to define variables 
    // that will hold the state of our app
    const [packetId, setPacketId] = useState<string>('A packet is loading'); // Placeholder value until the packet is loaded
    const [recipientId, setRecipientId] = useState<string>(''); // Holds the ID of the recipient packet
    const [message, setMessage] = useState<string>(''); // Holds the message to be sent
    const [notification, setNotification] = useState<string>(''); // Holds the content of the notification message

    const [adaptPacketWrapper, setAdaptPacketWrapper] = useState<adapt_wrappers.AdaptPacketWrapper | undefined>() // Holds the adapt packet wrapper

    const onButtonClick = () => {
        // Function to be called when the Send button is clicked
        // Will invoke the `send_message` transaction in the MUFL application

        // We first check if the ADAPT packet has been properly initialized
        if (!adaptPacketWrapper) {
            // If not, we notify the user about an internal error and stop further execution
            makeNotification("Internal error: ADAPT packet is not initialized.");
            return;
        }

        // If the ADAPT packet has been initialized, we form the transaction
        // We use the utility `adapt_js_api_utils.object_to_adapt_value` to convert our JavaScript object
        // into a MUFL value
        // Here, we're defining a transaction `::actor::send_message`
        // and setting the transaction argument which include the recipient's packet ID and the message
        const trn = adapt_js_api_utils.object_to_adapt_value({
            name: "::actor::send_message",
            targ: {
                packet_id: recipientId,
                data: message
            }
        });

        // Finally, we add this transaction to the ADAPT wrapper message queue
        adaptPacketWrapper.add_client_message(trn);
    }

    const makeNotification = (text: string) => {
        // Function to display the notification to the user

        setNotification(text);
    }

    useEffect(() => {
        // This function is executed just once when the page is loaded.
        // We will initialize ADAPT and create a packet here.
    
        // Extract the current URL search parameters.
        const urlSearch = window.location.search;
        const urlParams = new URLSearchParams(urlSearch);
    
        // Extract the seed phrase from URL parameters. This unique string is used for creating a packet.
        const seed_phrase = urlParams.get('seed');
    
        // Define the arguments needed for the adapt_wrapper_browser start function.
        const args = `--broker_address ws://127.0.0.1:9001 --logger_config --level ERROR --logger_config_end --packet --unit_hash B94412BA2BAE45913AD0425FB96AEAFBE1A56CBF75E293AC2E364ACD49E2E9B7 --unit_dir_path /static/mufl/ --seed_phrase ${seed_phrase}`;
    
        // Start the ADAPT wrapper in the browser.
        adapt_wrapper_browser.start(args.split(" ")).then(adapt_wrapper => {
            // Set a callback function that will be executed when the packet is created.
            adapt_wrapper.on_packet_created_cb = (packet_id, packet_wrapper) => {
                // packet_wrapper is the ADAPT packet wrapper managing the ADAPT application
                // Save the wrapper and the packet ID to the component state.
                setAdaptPacketWrapper(packet_wrapper);
                setPacketId(packet_id);
    
                // Set a callback function that will be executed when the packet returns data.
                packet_wrapper.on_return_data = (data: adapt_js_api.AdaptValue) => {
                    // Visualize the data and show a notification with the received message.
                    const message = data.Visualize();
                    makeNotification(message);
                }
            }
        })
    }, []);
    
    // Render our app
    return (
        <div className="container">
            <p>Your packet ID is: {packetId}</p> {/* Show our packet ID */}
            <input
                type="text"
                placeholder="Recipient ID"
                value={recipientId}
                onChange={e => setRecipientId(e.target.value)} // Update the recipientId variable when the input field changes
            />
            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={e => setMessage(e.target.value)} // Update the message variable when the input field changes
            />
            <button onClick={onButtonClick}> {/* Set the onButtonClick function to be called when the button is clicked */}
                Send Message
            </button>
            {notification && <div className="notification">{notification}</div>} {/* Display the notification if there is one */}
        </div>
    )
}

export default App;