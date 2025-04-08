import supabase from "../utils/SupabaseClient";
import { useEffect, useState } from "react";
import "./Signup-Login.css"; 
import { useNavigate } from "react-router-dom";


const Login = () => {
    const[email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [formError, setFormError] = useState(null); 
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setFormError(null); 

        if(!email || !password) {
            setFormError("Please input all fields");
            return; 
        }

        // sign in the user
        const {data: userData, error: userError} = await supabase.auth.signInWithPassword({ email, password }); 

        if(userError) {
            console.log("Auth Error: ", userError);
            setFormError(userError.error); 
            return
        }

        console.log("Sign in successful", userData); 
        navigate("/")
        
    }
    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <div className="header">
                    <div className="text">Event Manager</div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
                        <div className="input">
                            <i className="material-icons">mail</i>
                            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="input">
                            <i className="material-icons">key</i>
                            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <button type="submit" className="sign-up">Login</button>
                        <div className="forgot-login-container">
                            <a href="/">Forgot Password?</a>
                            <a href="/sign-up">Don't Have an Account?</a>
                        </div>
                </div>
                {formError && <div className="error">{formError}</div>}
            </form>
        </div>
    )
}

export default Login;
