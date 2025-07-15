import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomButton from './CustomButton';
import './DailyChallengeCard.css';

interface Challenge {
    id: number;
    title: string;
    description: string;
    funFact: string;
    date: string;
}

const DailyChallengeUpload = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const challenge = location.state?.challenge as Challenge;

    useEffect(() => {
        console.log('Challenge data:', challenge);
        if (!challenge) {
            setError('No challenge data found. Please select a challenge first.');
        }
    }, [challenge]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        if (!challenge) {
            setError('No challenge data found. Please go back and select a challenge.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            console.log('Checking server health...');
            const healthResponse = await fetch('http://localhost:3001/api/health');
            if (!healthResponse.ok) {
                throw new Error('Server is not reachable. Make sure it\'s running on port 3001');
            }
            console.log('✅ Server is reachable');

            const formData = new FormData();
            formData.append('photo', selectedFile);
            formData.append('challengeId', challenge.id.toString());
            formData.append('userId', '1');
            formData.append('userName', 'You');

            console.log('Uploading with data:', {
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                challengeId: challenge.id,
                userId: '1',
                userName: 'You'
            });

            const response = await fetch('http://localhost:3001/api/upload-submission', {
                method: 'POST',
                body: formData,
            });

            console.log('Upload response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload error response:', errorText);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Upload success:', result);

            setShowPopup(true);
        } catch (err) {
            console.error('Upload error:', err);
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Cannot connect to server. Make sure the backend is running on http://localhost:3001');
            } else {
                setError(err instanceof Error ? err.message : 'Upload failed');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleChangeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setError(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowPopup(false);
        }
    };

    const handlePopupConfirm = () => {
        setShowPopup(false);
        navigate('/student-posts');
    };

    if (!challenge) {
        return (
            <div>
                <h2 className="daily-title">Daily Challenge</h2>
                <div className="daily-card">
                    <div className="daily-content">
                        <div className="challenge-card">
                            <div className="card-content">
                                <p className="error-text">
                                    No challenge data found. Please go back and select a challenge.
                                </p>
                                <CustomButton
                                    text="Go Back"
                                    onClick={() => navigate(-1)}
                                />
                            </div>
                        </div>
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
                                <div className="daily-icon" />
                                <div>
                                    <div className="daily-subtitle">Daily Challenge</div>
                                </div>
                            </div>
                            <p className="challenge-text">{challenge.title}</p>
                            <p className="challenge-description">{challenge.description}</p>
                        </div>
                    </div>
                </div>

                <div className="daily-content">
                    <div className="challenge-card">
                        <div className="card-content">
                            <div className="daily-top-row">
                                <div className="upload-icon" />
                                <div className="daily-subtitle">Upload Photo</div>
                            </div>

                            {!selectedFile ? (
                                <>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        className="custom-button"
                                        onClick={() => document.getElementById('file-input')?.click()}
                                        type="button"
                                    >
                                        Choose Image
                                    </button>
                                </>
                            ) : (
                                <div className="selected-image-container">
                                    <p className="selected-file-text">
                                        Selected: {selectedFile.name}
                                    </p>

                                    {imagePreview && (
                                        <div className="image-preview">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    borderRadius: '0.5rem',
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <button
                                        className="custom-button change-image-button"
                                        onClick={handleChangeImage}
                                        type="button"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            )}

                            {error && <p className="error-text">{error}</p>}

                            {selectedFile && (
                                <CustomButton
                                    text={uploading ? 'Uploading...' : 'Upload'}
                                    onClick={handleUpload}
                                    disabled={uploading}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showPopup && (
                <div className="overlay" onClick={handleOverlayClick}>
                    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                        <p>Congratulations,<br />you completed the challenge!</p>
                        <CustomButton
                            text="View All Posts"
                            onClick={handlePopupConfirm}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyChallengeUpload;