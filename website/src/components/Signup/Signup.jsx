import React from "react";
import { Link } from 'react-router-dom'; 
import "./Signup.css"; 

const Signup = () => {
    return (
        <div className="container">
            <div className="header">
                <div className="text">Sign Up</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                <div className="input">
                    <i className="material-icons">person</i>
                    <input type="text" placeholder="Name"/>
                </div>
                <div className="input">
                    <i className="material-icons">mail</i>
                    <input type="email" placeholder="Email"/>
                </div>
                <div className="input">
                    <i className="material-icons">key</i>
                    <input type="password" placeholder="Password"/>
                </div>
                <div className="input">
                    <i className="material-icons">badge</i>
                    <input type="text" placeholder="User Type"/>
                </div>
                <div className="input">
                    <i className="material-icons">school</i>
                    <input type="text" placeholder="University"/>
                </div>
                <button className="sign-up">Sign Up</button>
            </div>
            <div className="forgot-login-container">
                <div className="forgot-password">Forgot Password?</div>
                <div className="login-page">Already Have an Account?</div>
            </div>
        </div>
    )
}

export default Signup; 