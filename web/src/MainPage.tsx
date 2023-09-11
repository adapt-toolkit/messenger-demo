import React, { useEffect, useRef, useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatList from './ChatList';
import { adapt_messenger_api } from './adapt_messenger_api'
import Tour from 'reactour'

interface MainPageProps {
    openNewMessengerTab: () => void
}

const MainPage: React.FC<MainPageProps> = ({openNewMessengerTab}) => {
    const [tourIsOpen, setTourIsOpen] = useState<boolean>(false);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [newTabOpened, setNewTabOpened] = useState<boolean>(false);


    const getTourStage = () => {
        return +(localStorage.getItem('tourStage') || '0');
    }

    const openTourStage = (stage: number, open: boolean = true) => {
        const savedStage = getTourStage();
        if (savedStage > stage) return;
        localStorage.setItem('tourStage', stage.toString());
        setCurrentStep(0);
        setTourIsOpen(open);
    }

    const newTabStage = () => {
        const alreadyOpened = localStorage.getItem('additioanalWindowOpened');
        if (alreadyOpened) {
            return;
        }
        localStorage.setItem('additioanalWindowOpened', "1");
        openTourStage(3, false);
        openNewMessengerTab();
    }

    const steps = [
        [ // stage 0
            { // step 0
                selector: '.set-username-button',
                content: 'Click this button to set your user name before using the chat.',
            },
        ],
        [ // stage 1
            {
                selector: '.username-display',
                content: 'Here you can see your current user name.',
            },
            {
                selector: '.create-chat-button',
                content: 'Click here to create a new chat.',
            },
        ],
        [ // stage 2
            {
                selector: '.chat-message',
                content: 'Here is the message you have just sent.'
            },
            {
                selector: '.chat-item',
                content: 'Notice that the message preview is shown in the chat list.'
            },
            {
                selector: '.copy-invite-code',
                content: "But no one can see our messages. So let's add another participant to the chat. For that we need to copy an invite to this chat."
            },
            {
                content: "For now, let's chat with ourselves. Click to open another messenger window in a new tab.",
            },
            {
                content: 'Click',
                action: () => {
                    if (!newTabOpened) {
                        setNewTabOpened(true);
                        newTabStage() // This will trigger the new tab to open when this step is activated.
                    }
                },
            }
        ],
        [ // stage 3
            {
                selector: '.connect-chat-button',
                content: "Now that we have copied the invite code, use it to join the chat. The code is already in your clipboard buffer."
            },
        ],
        [ // stage 4
            {
                selector: '.chat-history',
                content: "We don't see any previous messages since this client did not have an access to the chat when the messages were sent.",
            },
            {
                selector: '.chat-input input',
                content: "So let's message ourselves again from the adjacent tab!",
            },
            {
                content: 'Click',
                action: () => openTourStage(5, false),
            }
        ],
        [] // dummy stage 5
    ]

    const [chats, setChats] = useState<Array<{ name: string, id: string; history: Array<{ text: string, incoming: boolean, timestamp: string, from: string, color: string }>; has_unread: boolean }>>([]);
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [adaptMessengerApi, setAdaptMessengerApi] = useState<adapt_messenger_api.AdaptMessengerAPI | undefined>(undefined)
    const [userName, setUserName] = useState<string>("");
    const [copiedInviteCodeChatId, setCopiedInviteCodeChatId] = useState<string | null>(null);

    const createNewChat = () => {
        setTourIsOpen(false);
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
            openTourStage(4);
        }
    };

    const connectToChat = (code: string) => {
        if (adaptMessengerApi) {
            adaptMessengerApi.connect_to_chat(code);
        }
    };

    const sendMessage = (message: string) => {
        if (activeChat !== null && adaptMessengerApi) {
            setTourIsOpen(false);
            adaptMessengerApi.send_message(message, chats[activeChat].id);
        }
    };

    const receiveMessage = (chat_id: string, message: string, timestamp: string, from_id: string, from_name: string, incoming: boolean = true) => {
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
        openTourStage(2);
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
        openTourStage(1);
        if (getTourStage() === 3)
            openTourStage(3);
    }

    const setUserNameFromPrompt = () => {
        if (adaptMessengerApi) {
            const name = prompt("Please enter your user name:");
            if (name) {
                setTourIsOpen(false);
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

        const __tourStage = +(localStorage.getItem("tourStage") || "0");

        const onAdaptInitialized = (((stage: number, adapt_messenger_api: adapt_messenger_api.AdaptMessengerAPI) => {
            adapt_messenger_api.on_chat_created = __createNewChat;
            adapt_messenger_api.on_message_received = receiveMessage;
            adapt_messenger_api.on_set_user_name = onSetUserName;
            adapt_messenger_api.on_invite_code_generated = onInviteCodeGenerated;
            setAdaptMessengerApi(adapt_messenger_api);
            if (stage === 0)
            {
                openTourStage(0);
            }
        })).bind(this, __tourStage);

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

    const createTour = () => {
        return <Tour
            steps={steps[getTourStage()]}
            isOpen={tourIsOpen}
            onRequestClose={() => { setTourIsOpen(false) }}
            getCurrentStep={setCurrentStep}
            disableInteraction={false}
            startAt={currentStep}
        />

    }

    if (userName === '') {
        return (
            <div>
                {createTour()}
                <button className="set-username-button" onClick={setUserNameFromPrompt}>Set user name</button>
            </div>
        )
    }

    return (
        <div>
            {createTour()}
            <div className="username-display">Logged in as: {userName}</div>
            <button className="create-chat-button" onClick={createNewChat}>Create a new chat</button>
            <button className="connect-chat-button" onClick={connectToChatViaCode}>Connect to a chat</button>
            {activeChat !== null && <ChatWindow key={chats[activeChat].history.length} chat={chats[activeChat]} sendMessage={sendMessage} />}
            <ChatList chats={chats} setActiveChat={setActiveChatProxy} generateInviteCode={generateInviteCode} copiedInviteCodeChatId={copiedInviteCodeChatId} />
        </div>
    )
};

export default MainPage;

