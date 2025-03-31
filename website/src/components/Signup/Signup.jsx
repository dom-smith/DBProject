import React from "react";
import { Link } from 'react-router-dom'; 
import "./Signup.css"; 

const Signup = () => {
    return (
        <div className="container">
            <div className="header"></div>
                <div className="text">Sign Up</div>
                <div className="underline"></div>
            <div className="inputs">
                <div className="input">
                    <i className="material-icons">person</i>
                    <input type="text" />
                </div>
                <div className="input">
                    <i className="material-icons">mail</i>
                    <input type="email" />
                </div>
                <div className="input">
                    <i className="material-icons">key</i>
                    <input type="password" />
                </div>
                <div className="input">
                    <i className="material-icons">badge</i>
                    <input type="password" />
                </div>
                <div className="input">
                    <i className="material-icons">school</i>
                    <input type="password" />
                </div>
            </div>
            <div className="forgot-password">Forgot Password?</div>
            <div className="submit-container">
                <div className="submit">Already Have an Account?</div>
            </div>
        </div>
    )
}

export default Signup; 