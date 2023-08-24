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
    return (
        <div className="container">
            <Router>
                <Routes>
                    <Route path="/MainPage" element={<MainPage/>}/>
                    <Route path="/" element={<DemoIntroPage/>}/>
                </Routes>
            </Router>
        </div>
    );
}

export default App;
