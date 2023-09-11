import React from 'react';
import './App.css';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import DemoIntroPage from './DemoIntroPage';
import MainPage from './MainPage';

const App: React.FC = () => {
    const generateSeed = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    const openNewMessengerTab = () => {
        const seed = generateSeed();
        window.open(`/MainPage?seed=${seed}`, "_blank");
    }

    return (
        <div className="container">
            <Router>
                <Routes>
                    <Route path="/MainPage" element={<MainPage openNewMessengerTab={openNewMessengerTab}/>}/>
                    <Route path="/" element={<DemoIntroPage openNewMessengerTab={openNewMessengerTab}/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
