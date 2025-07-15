import { useState } from 'react';
import './DailyChallengeCard.css';
import CustomButton from './CustomButton';
import { useNavigate } from 'react-router-dom';
import './CreateAccount.css';

const CreateAccount = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleCreateAccount = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create account');
            }

            const result = await response.json();
            console.log('Account created:', result);
            navigate('/dailychallenge');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="create-account">
                <h1>Create an <br/>Account</h1>
            </div>
            <div className="daily-container">
                <div className="daily-card">
                    <div className="input-field">
                        <input
                            className="input-box"
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            className="input-box"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="input-box"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        <CustomButton
                            text={loading ? 'Creating Account...' : 'Create Account'}
                            onClick={handleCreateAccount}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;