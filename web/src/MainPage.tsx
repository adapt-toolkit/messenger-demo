import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';
import { adapt_messenger_api } from './adapt_messenger_api'

const MainPage: React.FC = () => {
    const [chats, setChats] = useState<Array<{ name: string, id: string; history: Array<{ text: string, incoming: boolean, timestamp: string }>; has_unread: boolean }>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [adaptMessengerApi, setAdaptMessengerApi] = useState<adapt_messenger_api.AdaptMessengerAPI | undefined>(undefined)

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

    const connectToChatViaLink = () => {
        const link = prompt("Please enter the chat link:");
        if (link) {
            connectToChat(link);
        }
    };

    const connectToChat = (link: string) => {
        if (adaptMessengerApi) {
            adaptMessengerApi.connect_to_chat(link);
        }
    };

    const sendMessage = (message: string) => {
        if (activeChat !== null && adaptMessengerApi) {
            adaptMessengerApi.send_message(message, chats[activeChat].id);
        }
    };

    const receiveMessage = (chat_id: string, message: string, timestamp: string, incoming: boolean = true) => {
        console.log("Received a new messaeg: ", message);

        const updatedChats = [...chatsRef.current];
        for (let chat of updatedChats) {
            if (chat.id === chat_id) {
                chat.history.push({ text: message, incoming: incoming, timestamp: timestamp });
                if (activeChatRef.current === null || chat.id !== updatedChats[activeChatRef.current]?.id) {
                    chat.has_unread = true;
                }
                break;
            }
        }
        setChats(updatedChats);
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


    const generateInviteLink = (chat_id: string) => {
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

    useEffect(() => {
        // This function is executed just once when the page is loaded.
        // We will initialize ADAPT and create a packet here.

        // Extract the current URL search parameters.
        const urlSearch = window.location.search;
        const urlParams = new URLSearchParams(urlSearch);

        // Extract the seed phrase from URL parameters. This unique string is used for creating a packet.
        let seed_phrase = urlParams.get('seed');

        if (!seed_phrase)
            seed_phrase = "default seed phrase";

        // Initialize ADAPT
        adapt_messenger_api.initialize(seed_phrase, (adapt_messenger_api => {
            adapt_messenger_api.on_chat_created = __createNewChat;
            adapt_messenger_api.on_message_received = receiveMessage;
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

    return (
        <div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaLink}>Connect to a chat via link</button>
            {activeChat !== null && <ChatWindow chat={chats[activeChat]} sendMessage={sendMessage} />}
            <ChatList chats={chats} setActiveChat={setActiveChatProxy} generateInviteLink={generateInviteLink} />
        </div>
    );
};

export default MainPage;

