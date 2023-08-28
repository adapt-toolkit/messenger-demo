import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';
import { adapt_messenger_api } from './adapt_messenger_api'

const MainPage: React.FC = () => {
    const default_broker_address = "ws://" + window.location.hostname + ":9001";
    const [chats, setChats] = useState<Array<{ name: string, id: string; history: Array<{ text: string, incoming: boolean, timestamp: string, from: string, color: string }>; has_unread: boolean }>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [adaptMessengerApi, setAdaptMessengerApi] = useState<adapt_messenger_api.AdaptMessengerAPI | undefined>(undefined)
    const [userName, setUserName] = useState<string>("");

    const createNewChat = () => {
        const name = prompt("Please enter the chat name:");
        if (name && adaptMessengerApi) {
            adaptMessengerApi.create_chat(name);
        }
    }

    const __createNewChat = (chat_id: string, name: string) => {

        setActiveChat(chatsRef.current.length)
        setChats([...chatsRef.current, { name, id: chat_id, history: [], has_unread: false }]);
    };

    const connectToChatViaCode = () => {
        const cookie = prompt("Please enter the invite code:");
        if (cookie) {
            connectToChat(cookie);
        }
    };

    const connectToChat = (code: string) => {
        if (adaptMessengerApi) {
            adaptMessengerApi.connect_to_chat(code);
        }
    };

    const sendMessage = (message: string) => {
        if (activeChat !== null && adaptMessengerApi) {
            adaptMessengerApi.send_message(message, chats[activeChat].id);
        }
    };

    const receiveMessage = (chat_id: string, message: string, timestamp: string, from_id: string, from_name: string, incoming: boolean = true) => {
        console.log("Received a new messaeg: ", message);

        const updatedChats = [...chatsRef.current];
        for (let chat of updatedChats) {
            if (chat.id === chat_id) {
                chat.history.push({ text: message, incoming: incoming, timestamp: timestamp, from: from_name, color: generateColor(from_id) });
                if (activeChatRef.current === null || chat.id !== updatedChats[activeChatRef.current]?.id) {
                    chat.has_unread = true;
                }
                break;
            }
        }
        setChats(updatedChats);
    };

    const generateColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
    
        // Get a value between 50 and 200 to get a shade of blue
        const value = (hash & 0xFF) % 150 + 50;  
        return `rgb(${value}, ${value}, 255)`;  // Adjusting only the blue value
    };

    // Use a ref to ensure the callback has the most recent `chats` and `activeChat` state
    const chatsRef = useRef(chats);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    const activeChatRef = useRef(activeChat);
    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);


    const generateInviteCode = (chat_id: string) => {
        if (adaptMessengerApi) {
            adaptMessengerApi.generate_invite(chat_id);
        }
    }

    const setActiveChatProxy = (index: number | null) => {
        setActiveChat(index);
        if (index !== null) {
            chats[index].has_unread = false;
        }
    }

    const onSetUserName = (user_name: string) => {
        setUserName(user_name);
    }

    const setUserNameFromPrompt = () => {
        if (adaptMessengerApi) {
            const name = prompt("Please enter your user name:");
            if (name) {
                adaptMessengerApi.set_user_name(name);
            }
        }
    }

    useEffect(() => {
        // This function is executed just once when the page is loaded.
        // We will initialize ADAPT and create a packet here.

        // Get the broker address from the local browser storage
        const brokerAddress = localStorage.getItem("brokerAddress") || default_broker_address;

        // Extract the current URL search parameters.
        const urlSearch = window.location.search;
        const urlParams = new URLSearchParams(urlSearch);

        // Extract the seed phrase from URL parameters. This unique string is used for creating a packet.
        let seed_phrase = urlParams.get('seed');

        if (!seed_phrase)
            seed_phrase = "default seed phrase";

        const code_id = process.env.REACT_APP_MUFLO_CODE_HASH;
        
        if (!code_id) {
            window.alert("Failed to obtain code id!");
            return;
        }

        // Initialize ADAPT
        adapt_messenger_api.initialize(brokerAddress, code_id, seed_phrase, (adapt_messenger_api => {
            adapt_messenger_api.on_chat_created = __createNewChat;
            adapt_messenger_api.on_message_received = receiveMessage;
            adapt_messenger_api.on_set_user_name = onSetUserName;
            setAdaptMessengerApi(adapt_messenger_api);
        }))
    }, []);


    if (!adaptMessengerApi) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <h3>Loading ADAPT framework...</h3>
            </div>
        );
    }

    if (userName === '') {
        return (
            <div>
                <button className="set-username-button" onClick={setUserNameFromPrompt}>Set user name</button>
            </div>
        )
    }

    return (
        <div>
            <div className="username-display">Logged in as: {userName}</div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaCode}>Connect to a chat</button>
            {activeChat !== null && <ChatWindow key={chats[activeChat].history.length} chat={chats[activeChat]} sendMessage={sendMessage} />}
            <ChatList chats={chats} setActiveChat={setActiveChatProxy} generateInviteCode={generateInviteCode} />
        </div>
    );
};

export default MainPage;

