import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DailyChallengeCard.css';
import CustomButton from "./CustomButton.tsx";

interface Challenge {
    id: number;
    title: string;
    description: string;
    funFact: string;
    date: string;
}

const DailyChallengeCard = () => {
    const [secondsLeft, setSecondsLeft] = useState(64787);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDailyChallenge();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDailyChallenge = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/daily-challenge');
            if (!response.ok) {
                throw new Error('Failed to fetch challenge');
            }
            const challengeData = await response.json();
            setChallenge(challengeData);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const [h, m, s] = [
            Math.floor(totalSeconds / 3600),
            Math.floor((totalSeconds % 3600) / 60),
            totalSeconds % 60,
        ];
        return [h, m, s].map(unit => String(unit).padStart(2, '0')).join(':');
    };

    const handleAccept = () => {
        if (challenge) {
            navigate('/upload', { state: { challenge } });
        }
    };

    if (loading) {
        return (
            <div>
                <h2 className="daily-title">Daily Challenge</h2>
                <div className="daily-card">
                    <div className="daily-content">
                        <p>Loading today's challenge...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 className="daily-title">Daily Challenge</h2>
                <div className="daily-card">
                    <div className="daily-content">
                        <p>Error loading challenge: {error}</p>
                        <CustomButton text="Retry" onClick={fetchDailyChallenge} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="daily-title">Daily Challenge</h2>
            <div className="daily-card">
                <div className="daily-content">
                    <div className="challenge-card">
                        <div className="card-content">
                            <div className="daily-top-row">
                                <div className="daily-icon"/>
                                <div>
                                    <div className="daily-subtitle">Daily Challenge</div>
                                    <div className="daily-time">{formatTime(secondsLeft)}</div>
                                </div>
                            </div>
                            <p className="challenge-text">{challenge?.title}</p>
                            <div className="fun-facts-box">
                                {challenge?.funFact}
                            </div>
                        </div>
                    </div>
                </div>
                <CustomButton text="Accept" onClick={handleAccept} className="accept-button" />
            </div>
        </div>
    );
};

export default DailyChallengeCard;
