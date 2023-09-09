import React from 'react';
import './DemoIntroPage.css';

const DemoIntroPage: React.FC = () => {
    
    const generateSeed = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const handleButtonClick = () => {
        const seed1 = generateSeed();
        const seed2 = generateSeed();
        window.open(`/MainPage?seed=${seed1}`, "_blank");
        window.open(`/MainPage?seed=${seed2}`, "_blank");
    }

    const handleAdditionalTabClick = () => {
        const seed = generateSeed();
        window.open(`/MainPage?seed=${seed}`, "_blank");
    }

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
                <button onClick={handleButtonClick}>Launch demo</button>
                <button onClick={handleAdditionalTabClick} className="additional-tab-button">Additional messenger tab</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
