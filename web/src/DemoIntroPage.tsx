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
                    This project demonstrates a bare bones web-messenger with end-to-end encryption using ADAPT framework.<br />

                    ADAPT Framework is a developer toolkit for building distributed data meshes 
                    that replace the backend of Web applications. The framework enables creation of front-end data nodes 
                    with embedded business logic, that communicate using a dumb message broker. The logic within the 
                    data nodes is built using ADAPT's special-purpose language called MUFL. <br />

                    Click "Launch demo" to chat to yourself.<br />
                    Share the invite link with a friend to chat together.<br /><br />

                    This demo is built with mere 289 lines of MUFL code.
                </p>
                <h3>Give it a try</h3>
                <button onClick={handleButtonClick}>Launch demo</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
