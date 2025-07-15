import React from 'react';
import Header from './Header';
import DailyChallengeCard from './DailyChallengeCard';
import DailyChallengeUpload from './DailyChallengeUpload';
import { Routes, Route } from 'react-router-dom';
import StudentPosts from "./StudentPosts.tsx";
import Welcome from "./Welcome.tsx";
import CreateAccount from "./CreateAccount";
import Leaderboard from "./Leaderboard";

const App: React.FC = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/createaccount" element={<CreateAccount/>}/>
                <Route path="/dailychallenge" element={<DailyChallengeCard />} />
                <Route path="/upload" element={<DailyChallengeUpload />} />
                <Route path="/student-posts" element={<StudentPosts />} />
                <Route path="/leaderboard" element={<Leaderboard/>}/>
            </Routes>
        </>
    );
};

export default App;
