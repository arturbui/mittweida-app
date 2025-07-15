import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';
import './DailyChallengeCard.css';
import CustomButton from './CustomButton';

interface LeaderboardEntry {
    rank: number;
    name: string;
    streak: number;
}

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/leaderboard');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }
            const data = await response.json();
            setLeaderboardData(data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#FFFFFF';
        }
    };

    if (loading) {
        return (
            <div className="daily-container">
                <div className="title-row">
                    <h1 className="daily-title">Leaderboard</h1>
                </div>
                <CustomButton className="back-button" onClick={handleBack}/>
                <div className="daily-card">
                    <div className="daily-content">
                        <p>Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="daily-container">
                <div className="title-row">
                    <h1 className="daily-title">Leaderboard</h1>
                </div>
                <CustomButton className="back-button" onClick={handleBack}/>
                <div className="daily-card">
                    <div className="daily-content">
                        <p>Error loading leaderboard: {error}</p>
                        <CustomButton text="Retry" onClick={fetchLeaderboard} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="daily-container">
            <div className="title-row">
                <h1 className="daily-title">Leaderboard</h1>
            </div>
            <CustomButton className="back-button" onClick={handleBack}/>
            <div className="daily-card">
                {leaderboardData.length === 0 ? (
                    <div className="daily-content">
                        <p>No users on the leaderboard yet. Complete challenges to appear here!</p>
                    </div>
                ) : (
                    leaderboardData.map((user, index) => (
                        <div key={index} className="leaderboard-entry">
                            <div className="user-info">
                                <div className="user-avatar"></div>
                                <div className="user-details">
                                    <div className="user-name">{user.name}</div>
                                    <div className="user-streak">Streak <span className="streak-count">{user.streak}</span></div>
                                </div>
                            </div>
                            <div
                                className="rank-number"
                                style={{ color: getRankColor(user.rank) }}
                            >
                                {user.rank}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;