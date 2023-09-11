import React from 'react';
import './DemoIntroPage.css';

const DemoIntroPage: React.FC = () => {
    
    const generateSeed = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const handleButtonClick = () => {
        const seed = generateSeed();
        window.open(`/MainPage?seed=${seed}`, "_blank");
    }

    return (
        <div className="demo-container">
            <div className="demo-content">
                <h2>ADAPT Messenger Demo</h2>
                <p>
                    This demo showcases a simple browser-based no-back-end messenger with end-to-end encryption.<br />

                    The messages are broadcast securely, with each recipient in a group chat receiving a uniquely encrypted message<br />
                    The business loggic is written in just under 300 lines of MUFL code.<br /><br />

                    This demo allows you to chat with another user. If you have an invite code from them, click "Launch demo" to open a new chat window, click "connect to chat" and enter that code
                </p>
                <h3>Give it a try</h3>
                <button onClick={handleButtonClick}>Launch demo</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
