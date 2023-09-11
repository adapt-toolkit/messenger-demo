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
                    This demo demonstrates a fully operational web-messenger.<br />
                    It is decentralized.<br />
                    It is end-to-end encrypted.<br /><br />

                    Click "Launch demo" to chat to yourself.<br />
                    Share the invite link with a friend to chat together.<br /><br />

                    And it is written in sheer 289 lines of MUFL code: just the amount of symbols this text has.
                </p>
                <h3>Give it a try</h3>
                <button onClick={openNewMessengerTab}>Launch demo</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
