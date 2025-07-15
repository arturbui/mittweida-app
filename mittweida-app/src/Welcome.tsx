import './Welcome.css';
import { useNavigate } from 'react-router-dom';
import CustomButton from "./CustomButton.tsx";
import './DailyChallengeCard.css'

const Welcome = () => {

    const navigate = useNavigate();

    const handleUpload =() =>{
        navigate('/CreateAccount')
    }

    return (


        <div>
            <div className="welcome-title">Welcome!</div>
            <div className="welcome-description">Unlock the secrets <br /> of Mittweida!</div>
            <div className="welcome-description-2">Conquer daily quests <br /> and become the best!</div>
            <div className="button-wrapper">
            <CustomButton text="Start" onClick={handleUpload} />
        </div>
        </div>
    )
}
export default Welcome;



