import React, { useEffect, useRef, useState } from 'react';

interface ChatWindowProps {
    chat: { id: string; name: string; history: Array<{ text: string, incoming: boolean, timestamp: string }> };
    sendMessage: (message: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, sendMessage }) => {
    const [message, setMessage] = useState<string>('');
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatHistoryRef.current) {
                chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight; // Scroll to the bottom
            }
        }, 0); // 0 ms timeout ensures this code runs after the rest of the render logic
    };
    useEffect(() => {
        scrollToBottom();
    }, [chat && chat.history]); // Re-run when the chat history changes

    const onSendClick = () => {
        if (message.trim() !== '') {
            sendMessage(message.trim());
            setMessage('');
            scrollToBottom(); // Scroll to the bottom when a new message is sent
        }
    };

    if (!chat) {
        return null;
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h3 className="chat-name">{chat.name}</h3>
                <h3 className="chat-id">Chat ID:
                    {chat.id.length > 10 ? `${chat.id.substring(0, 10)}...` : chat.id}
                </h3>
            </div>
            <div className="chat-history" ref={chatHistoryRef}>
                {chat.history.length === 0 ? (
                    <div className="no-messages">No messages yet in this chat.</div>
                ) : (
                    chat.history.map((message, index) => (
                        <div key={index} className={`chat-message ${message.incoming ? 'incoming' : 'outgoing'}`}>
                            <span className="chat-timestamp">{message.timestamp}</span>
                            {message.text}
                        </div>
                    ))
                )}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={onSendClick}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
