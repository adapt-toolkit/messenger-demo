import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';

const MainPage: React.FC = () => {
    const [chats, setChats] = useState<Array<{ name: string, id: string; history: Array<{ text: string, incoming: boolean }> }>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);


    const createNewChat = () => {
        const name = prompt("Please enter the chat name:");
        if (name) {
            __createNewChat(name);
        }
    }

    const __createNewChat = (name: string) => {
        const newChatId = `${Date.now()}`; 
        setChats([...chats, { name, id: newChatId, history: [] }]);
        setActiveChat(chats.length);
    };

    const connectToChatViaLink = () => {
        const link = prompt("Please enter the chat link:");
        if (link) {
          connectToChat(link);
        }
      };

    const connectToChat = (link: string) => {
        // Placeholder for connecting to an existing chat via a link
    };

    const sendMessage = (message: string) => {
        if (activeChat !== null) {
            const updatedChats = [...chats];
            updatedChats[activeChat].history.push({ text: message, incoming: false }); // Outgoing message
            setChats(updatedChats);
            // You may also want to send the message to the corresponding recipient through ADAPT here
        }
    };

    return (
        <div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaLink}>Connect to a chat via link</button>
            {activeChat !== null && <ChatWindow chat={chats[activeChat]} sendMessage={sendMessage} />}
            <ChatList chats={chats} setActiveChat={setActiveChat} />
        </div>
    );
};

export default MainPage;

