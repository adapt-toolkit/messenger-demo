import React from 'react';

interface ChatListProps {
    chats: Array<{ id: string; name: string; history: Array<{ text: string, incoming: boolean }> }>;
    setActiveChat: (chatIndex: number | null) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, setActiveChat }) => {
    return (
        <div className="chat-list">
            {chats.length > 0 && <h3>Existing Chats</h3>} {/* Only show the heading if there are chats */}
            {chats.map((chat, index) => (
                <div key={index} className="chat-item">
                    <button className="chat-name-button" onClick={() => setActiveChat(index)}>
                        {chat.name}
                    </button>
                    <button className="copy-invite-link-button" onClick={() => { /* Handle copying invite link */ }}>
                        Copy invite link
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ChatList;
