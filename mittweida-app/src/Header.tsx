import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    userId?: number;
    refreshTrigger?: number;
}

const Header: React.FC<HeaderProps> = ({ userId, refreshTrigger }) => {
    const location = useLocation();
    const hideProfile = location.pathname === '/' || location.pathname === '/CreateAccount';
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const fetchUserStreak = async () => {
            if (userId) {
                try {
                    const response = await fetch(`http://localhost:3001/api/user/${userId}`);
                    if (response.ok) {
                        const userData = await response.json();
                        setStreak(userData.streak || 0);
                        console.log('Updated streak:', userData.streak);
                    }
                } catch (error) {
                    console.error('Error fetching user streak:', error);
                }
            }
        };

        fetchUserStreak();
    }, [userId, refreshTrigger]);

    return (
        <header className="header">
            <div className="circle logo">Logo</div>
            {!hideProfile && (
                <div className="profile-section">
                    <div className="circle profile">Profile</div>
                    <div className="streak">Streak <span className="streak-count">{streak}</span></div>
                </div>
            )}
        </header>
    );
};

export default Header;
