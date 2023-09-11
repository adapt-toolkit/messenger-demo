import React from 'react';
import './DemoIntroPage.css';

interface DemoIntroPageProps {
    openNewMessengerTab: () => void
}

const DemoIntroPage: React.FC<DemoIntroPageProps> = ({openNewMessengerTab}) => {
    return (
        <div className="demo-container">
            <div className="demo-content">
                <h2>ADAPT Messenger Demo</h2>
                <p>
                    This demo showcases a simple browser-based no-back-end messenger with end-to-end encryption.<br /><br />

                    The messages are broadcast securely, with each recipient in a group chat receiving a uniquely encrypted message.<br /><br />
                    The business loggic is written in just under 300 lines of MUFL code.<br /><br />

                    This demo allows you to chat with another user. If you have an invite code from them, click "Launch demo" to open a new chat window, click "connect to chat" and enter that code.
                </p>
                <h3>Give it a try</h3>
                <button onClick={openNewMessengerTab}>Launch demo</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
