import React from 'react';
import './DailyChallengeCard.css';

interface CustomButtonProps {
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?:boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, onClick, className,disabled }) => {
    return (
        <button  className={`custom-button ${className || ''}`}
                 onClick={onClick}
                 disabled={disabled}>
            {text}
        </button>
    );
};

export default CustomButton;
