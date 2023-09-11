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
                    This project demonstrates a bare bones web-messenger with end-to-end encryption using ADAPT framework.<br /><br />

                    ADAPT Framework is a developer toolkit for building distributed data meshes 
                    that replace the backend of Web applications. The framework enables creation of front-end data nodes 
                    with embedded business logic, that communicate using a dumb message broker. The logic within the 
                    data nodes is built using ADAPT's special-purpose language called MUFL. <br /><br />

                    The messages between participants are broadcast securely, 
                    with each recipient in a group chat receiving a uniquely encrypted message.<br /><br />

                    This demo is built with just under 300 lines of MUFL code.

                    For full context on this demo and the framework, please see <a href="https://github.com/adapt-toolkit/messenger-demo/tree/release-0.2" target="_blank">the README file.</a>

                    If you experience any issues, please ping us on our <a href="https://discord.gg/VjKSBS2u7H">Discord</a>
                    and we will be happy to help. 
                </p>
                <h3>Give it a try</h3>
                <button onClick={openNewMessengerTab}>Launch demo</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
