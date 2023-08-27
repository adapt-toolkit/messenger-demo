import React, { useEffect, useState } from 'react';
import './DemoIntroPage.css';

const DemoIntroPage: React.FC = () => {
    const [brokerAddress, setBrokerAddress] = useState<string>(`ws://${window.location.hostname}:9001`);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    
    const generateSeed = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    const handleButtonClick = () => {
        const seed = generateSeed();
        window.open(`/MainPage?seed=${seed}`, "_blank");
    }

    const handleBrokerAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBrokerAddress(event.target.value);
    }

    const handleSubmitBrokerAddress = () => {
        localStorage.setItem("brokerAddress", brokerAddress);
        setShowSettings(false);
    }

    useEffect(() => {
        const savedBrokerAddress = localStorage.getItem("brokerAddress");
        if (savedBrokerAddress) {
            setBrokerAddress(savedBrokerAddress);
        }
    }, []);


    return (
        <div className="demo-container">
            <div className="demo-content">
                <h1>Welcome to Our Product</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur leo. Sed vehicula neque vel purus laoreet, quis fermentum diam malesuada.
                    ... [Continue your description here]
                </p>
                <h3>Give it a try</h3>
                <button onClick={handleButtonClick}>Launch messenger</button>
                <div className="settings-section">
                    <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
                    {showSettings && (
                        <div className="broker-settings">
                            <label>Broker Address: </label>
                            <input type="text" value={brokerAddress} onChange={handleBrokerAddressChange} />
                            <button onClick={handleSubmitBrokerAddress}>Update</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DemoIntroPage;
