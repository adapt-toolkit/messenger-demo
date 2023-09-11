import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';
import { adapt_messenger_api } from './adapt_messenger_api'

interface MainPageProps {
    openNewMessengerTab: () => void
}

const MainPage: React.FC<MainPageProps> = ({ openNewMessengerTab }) => {


    const [chats, setChats] = useState<Array<{
        name: string,
        id: string;
        history: Array<{
            text: string,
            incoming: boolean,
            timestamp: string,
            from: string,
            bgColor: string,
            mainTextColor: string,
            labelTextColor: string
        }>;
        has_unread: boolean
    }>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [adaptMessengerApi, setAdaptMessengerApi] = useState<adapt_messenger_api.AdaptMessengerAPI | undefined>(undefined)
    const [userName, setUserName] = useState<string>("");
    const [copiedInviteCodeChatId, setCopiedInviteCodeChatId] = useState<string | null>(null);
    const userColorMapRef = useRef(new Map());

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
        const updatedChats = [...chatsRef.current];
        for (let chat of updatedChats) {
            if (chat.id === chat_id) {
                let colorTrio;
                if (userColorMapRef.current.has(from_id)) {
                    colorTrio = userColorMapRef.current.get(from_id);
                } else {
                    colorTrio = generateColorTrio();
                    userColorMapRef.current.set(from_id, colorTrio);
                }
                chat.history.push({
                    text: message,
                    incoming: incoming,
                    timestamp: timestamp,
                    from: from_name,
                    bgColor: colorTrio.bgColor,
                    mainTextColor: colorTrio.mainTextColor,
                    labelTextColor: colorTrio.labelTextColor
                });
                if (activeChatRef.current === null || chat.id !== updatedChats[activeChatRef.current]?.id) {
                    chat.has_unread = true;
                }
                break;
            }
        }
        setChats(updatedChats);
    };

    const getRandomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const getLuminance = (r: number, g: number, b: number): number => {
        let RsRGB = r / 255;
        let GsRGB = g / 255;
        let BsRGB = b / 255;

        let R = (RsRGB <= 0.03928) ? RsRGB / 12.92 : Math.pow(((RsRGB + 0.055) / 1.055), 2.4);
        let G = (GsRGB <= 0.03928) ? GsRGB / 12.92 : Math.pow(((GsRGB + 0.055) / 1.055), 2.4);
        let B = (BsRGB <= 0.03928) ? BsRGB / 12.92 : Math.pow(((BsRGB + 0.055) / 1.055), 2.4);

        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    const generateColorTrio = (): { bgColor: string, mainTextColor: string, labelTextColor: string } => {
        let bgR = Math.floor((getRandomInt(170, 255) + 255) / 2); // Mix with white
        let bgG = Math.floor((getRandomInt(170, 255) + 255) / 2);
        let bgB = Math.floor((getRandomInt(170, 255) + 255) / 2);

        let bgColor = `rgb(${bgR}, ${bgG}, ${bgB})`;
        let luminance = getLuminance(bgR, bgG, bgB);

        let mainTextColor = (luminance > 0.5) ? 'black' : 'white';

        let labelTextColor;
        if (luminance > 0.7) {
            labelTextColor = 'darkgrey'; // Darker than black for distinction
        } else if (luminance < 0.3) {
            labelTextColor = 'lightgrey'; // Lighter than white for distinction
        } else {
            labelTextColor = (mainTextColor === 'black') ? 'white' : 'black'; // Opposite of main text
        }

        return {
            bgColor: bgColor,
            mainTextColor: mainTextColor,
            labelTextColor: labelTextColor
        };
    }

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

    const onInviteCodeGenerated = async (chat_id: string, invite: string) => {
        setCopiedInviteCodeChatId(chat_id);
        try {
            await navigator.clipboard.writeText(invite);
            setTimeout(() => setCopiedInviteCodeChatId(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy invite code', err);
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
        const brokerAddress = process.env.REACT_APP_BROKER_ADDRESS;

        if (!brokerAddress) {
            window.alert("Failed to obtain code id!");
            return;
        }

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

        const onAdaptInitialized = (adapt_messenger_api: adapt_messenger_api.AdaptMessengerAPI) => {
            adapt_messenger_api.on_chat_created = __createNewChat;
            adapt_messenger_api.on_message_received = receiveMessage;
            adapt_messenger_api.on_set_user_name = onSetUserName;
            adapt_messenger_api.on_invite_code_generated = onInviteCodeGenerated;
            setTimeout(() => {
                setAdaptMessengerApi(adapt_messenger_api);
            }, 2000);
        }

        // Initialize ADAPT
        adapt_messenger_api.initialize(brokerAddress, code_id, seed_phrase, onAdaptInitialized)

    }, []);


    if (!adaptMessengerApi) {
        return (
            <div className="loading-container">
                <h3>Loading ADAPT framework...</h3>
                <p>
                    WASM system starting, this may take a few seconds.
                </p>
            </div>
        );
    }

    if (userName === '') {
        return (
            <div>
                <div className="instructions-text">
                    This initial screen given you a way to set your user name to be used in the chat. Please click the 'set user name' button and enter the user name into the popup.
                </div>
                <button className="set-username-button" onClick={setUserNameFromPrompt}>Set user name</button>
            </div>
        )
    }

    return (
        <div>
            <div className="instructions-text">
                This is the main screen of the messenger. It starts with two buttons: 'create new chat' and 'connect to chat'. if this is your first use of the demo, please click the 'create new chat' button and enter the chat name into the popup. If you already have a chat a going, then click 'connect to chat' and enter the chat invite code.
                <br/><br/>
                Once you have a chat going, you can send messages by typing into the text box at the bottom of the screen and clicking 'send'. You can also click the 'new messenger tab' button to open a new tab with the chat client.
                <br/><br/>
                Click 'copy invite code' to copy the invite code for the current chat to your clipboard.
                <br/><br/>
                You can use this code to connect to the same chat as a different user from another tab on your device or send it to a friend.
            </div>
            <div className="username-display">Logged in as: {userName}</div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaCode}>Connect to a chat</button>
            {activeChat !== null && <ChatWindow key={chats[activeChat].history.length} chat={chats[activeChat]} sendMessage={sendMessage} />}
            <div className="chat-section">
                <ChatList chats={chats} setActiveChat={setActiveChatProxy} generateInviteCode={generateInviteCode} copiedInviteCodeChatId={copiedInviteCodeChatId} />
                {activeChat !== null &&
                    <button className="open-tab-button" onClick={openNewMessengerTab}>
                        New messenger tab
                    </button>
                }
            </div>
        </div>
    )
};

export default MainPage;

