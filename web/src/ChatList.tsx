import React from 'react';

interface ChatListProps {
    chats: Array<{ id: string; name: string; history: Array<{ text: string, incoming: boolean }>; has_unread: boolean }>;
    setActiveChat: (chatIndex: number | null) => void;
    generateInviteLink: (chat_id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, setActiveChat, generateInviteLink }) => {

    const onCopyInviteLink = (chat_id: string) => {
        generateInviteLink(chat_id);
    }

    if (chats.length === 0) { return null }

    return (
        <div className="chat-list">
            <h3>{chats.length > 0 && `Existing Chats: ${chats.length}`}</h3>
            {chats.map((chat, index) => (
                <div key={index} className="chat-item" onClick={() => setActiveChat(index)}>
                    <div className="chat-name">{chat.name}</div>
                    <div className="chat-preview">
                        {chat.history.length === 0 ? (
                            'No messages'
                        ) : (
                            <span className={chat.has_unread ? 'unread' : ''}>
                                {chat.history[chat.history.length - 1].text}
                            </span>
                        )}
                    </div>
                    <button
                        className="copy-invite-link"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the chat item click
                            onCopyInviteLink(chat.id);
                        }}
                    >
                        Copy invite link
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ChatList;

