import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';

const MainPage: React.FC = () => {
    const [chats, setChats] = useState<Array<{ name: string, id: string; history: Array<{ text: string, incoming: boolean, timestamp: string }>; has_unread: boolean}>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);


    const createNewChat = () => {
        const name = prompt("Please enter the chat name:");
        if (name) {
            __createNewChat(name);
        }
    }

    const __createNewChat = (name: string) => {
        const newChatId = `${Date.now()}`; 
        setChats([...chats, { name, id: newChatId, history: [], has_unread: true }]);
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
            updatedChats[activeChat].history.push({ text: message, incoming: false, timestamp: "2023-01-01 9:45:51" }); // Outgoing message
            setChats(updatedChats);
            // You may also want to send the message to the corresponding recipient through ADAPT here
            updatedChats.forEach(chat => {
                receiveMessage(chat.id, message, "2023-01-01 9:45:52");
            })
        }
    };

    const receiveMessage = (chat_id: string, message: string, timestamp: string, incoming: boolean = true) => {
        const updatedChats = [...chats];
        for (let chat of updatedChats) {
            if (chat.id === chat_id) {
                chat.history.push({ text: message, incoming: incoming, timestamp: timestamp });
                if (activeChat !== null && chat.id !== chats[activeChat].id) {
                    chat.has_unread = true;
                }
                break;       
            }
        }
        setChats(updatedChats);
    }

    const setActiveChatProxy = (index: number | null) => {
        setActiveChat(index);
        if (index !== null) {
            chats[index].has_unread = false;
        }
    }

    return (
        <div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaLink}>Connect to a chat via link</button>
            {activeChat !== null && <ChatWindow chat={chats[activeChat]} sendMessage={sendMessage} />}
            <ChatList chats={chats} setActiveChat={setActiveChatProxy} />
        </div>
    );
};

export default MainPage;

