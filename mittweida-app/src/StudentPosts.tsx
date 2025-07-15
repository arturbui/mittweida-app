import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DailyChallengeCard.css';
import './StudentPosts.css';
import CustomButton from "./CustomButton.tsx";

interface Submission {
    id: number;
    challengeId: number;
    userId: number;
    userName: string;
    photoUrl: string;
    submittedAt: string;
    timestamp: string;
    fileExists?: boolean;
}

const StudentPosts = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching submissions');
            const response = await fetch('http://localhost:3001/api/submissions');

            if (!response.ok) {
                throw new Error(`Failed to fetch submissions: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received submissions:', data);
            setSubmissions(data);
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaderboard = () => {
        navigate('/leaderboard');
    };

    const handleImageError = (submissionId: number, imageUrl: string) => {
        console.error('Image failed to load:', imageUrl);
        setImageErrors(prev => ({
            ...prev,
            [submissionId]: true
        }));
    };

    const handleImageLoad = (submissionId: number, imageUrl: string) => {
        console.log('Image loaded successfully:', imageUrl);
        setImageErrors(prev => ({
            ...prev,
            [submissionId]: false
        }));
    };

    const getImageSrc = (submission: Submission) => {
        const baseUrl = 'http://localhost:3001';
        const imageSrc = submission.photoUrl.startsWith('/uploads/')
            ? `${baseUrl}${submission.photoUrl}`
            : `${baseUrl}/uploads/${submission.photoUrl}`;

        console.log('Image source for submission', submission.id, ':', imageSrc);
        return imageSrc;
    };

    if (loading) {
        return (
            <div>
                <h1 className="student-title">Student Posts</h1>
                <div className="daily-card">
                    <div className="daily-content">
                        <p>Loading submissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1 className="student-title">Student Posts</h1>
                <div className="daily-card">
                    <div className="daily-content">
                        <CustomButton text="Retry" onClick={fetchSubmissions} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <CustomButton className="leaderboard-icon" onClick={handleLeaderboard}/>
            <h1 className="student-title">Student Posts</h1>
            <div className="posts-scroll">
                {submissions.length === 0 ? (
                    <div className="daily-card">
                        <div className="daily-content">
                            <p>No submissions yet. Be the first to complete today's challenge!</p>
                        </div>
                    </div>
                ) : (
                    submissions.map((submission) => {
                        const imageSrc = getImageSrc(submission);
                        const hasImageError = imageErrors[submission.id];

                        return (
                            <div key={submission.id} className="post-entry">
                                <div className="student-name-row">
                                    <span className="student-name">{submission.userName}</span>
                                    <span className="post-time">{submission.timestamp}</span>
                                </div>
                                <div className="daily-card">
                                    <div className="challenge-card post-card">
                                        {hasImageError ? (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '200px',
                                                backgroundColor: '#f5f5f5',
                                                color: '#666',
                                                flexDirection: 'column',
                                                borderRadius: '0.5rem'
                                            }}>
                                                <p>Image failed to load</p>
                                                <p style={{ fontSize: '12px' }}>URL: {imageSrc}</p>
                                                <button
                                                    onClick={() => {
                                                        setImageErrors(prev => ({
                                                            ...prev,
                                                            [submission.id]: false
                                                        }));
                                                    }}
                                                    style={{
                                                        padding: '5px 10px',
                                                        margin: '5px',
                                                        backgroundColor: '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        ) : (
                                            <img
                                                src={imageSrc}
                                                alt={`Challenge submission by ${submission.userName}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '0.5rem'
                                                }}
                                                onError={() => handleImageError(submission.id, imageSrc)}
                                                onLoad={() => handleImageLoad(submission.id, imageSrc)}
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                </div>


                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default StudentPosts;
