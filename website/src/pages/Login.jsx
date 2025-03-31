import supabase from "../utils/SupabaseClient";
import { useEffect, useState } from "react";
import "./Signup-Login.css"; 


const Login = () => {
    const[name, setName] = useState('');
    const [method, setMethod] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [role, setRole] = useState(''); 
    const [formError, setFormError] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 

    }
    return (
        <div className="container">
        <div className="header">
            <div className="text">Event Manager</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
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
            <button className="sign-up">Login</button>
        </div>
        <div className="forgot-login-container">
            <div className="forgot-password"><a href="/">Forgot Password?</a></div>
            <div className="login-page"><a href="/sign-up">Don't Have an Account?</a></div>
        </div>
        </div>
    )
}

export default Login;
