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
                <h1>Welcome to Our Product</h1>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum. Donec in efficitur leo. Sed vehicula neque vel purus laoreet, quis fermentum diam malesuada.
                    ... [Continue your description here]
                </p>
                <h3>Give it a try</h3>
                <button onClick={handleButtonClick}>Launch messenger</button>
            </div>
        </div>
    );
}

export default DemoIntroPage;
