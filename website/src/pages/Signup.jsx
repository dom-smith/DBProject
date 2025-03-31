import { useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import "./Signup-Login.css"; 
import supabase from "../config/SupabaseClient";

const Signup = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    // const [method, setMethod] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState('');
    const [university, setUniversity] = useState(''); 
    const [role, setRole] = useState(''); 
    const [formError, setFormError] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setFormError(null); 

        // validates that data in the form was inputted 
        if(!name || !email || !password || !confirmPassword || !role || !university) {
            setFormError('Please fill in all fields correctly'); 
            return; 
        }

        if (password !== confirmPassword) {
            setFormError('Passwords must match'); 
            return;
        }

        // request to supabase and create new supabase user
        const {data: authData, error:authError} = await supabase.auth.signUp({email, password});

        if(authError) {
            console.log("Auth Error:", authError);              // Used for debugging
            setFormError(authError.message);
            return;
        }

        console.log("Auth successful", authData)                // Used for debugging

        // Insert the data into the users table
        const userId = authData?.user?.id;                      // get user id id if it exists

        if(!userId) {
            setFormError("User ID not found after signup"); 
            return; 
        }        

        // Make request to supabase 
        const { data: userData, error: userError } = await supabase
            .from("users")
            .insert([{ user_id: userId, name, email, university, role }])
            .select();        

        if (userError) {
            console.log("User table error:", userError); 
            setFormError("Error saving user details."); 
            return; 
        }

        console.log("User has been created:", userData);        // Used for debugging
        navigate('/'); 
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
                        <i className="material-icons">person</i>
                        <input 
                            type="text" 
                            placeholder="Name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="input">
                        <i className="material-icons">mail</i>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input">
                        <i className="material-icons">key</i>
                        <input 
                            type="password" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input">
                        <i className="material-icons">key</i>
                        <input 
                            type="password" 
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e)=> setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className="input">
                        <i className="material-icons">badge</i>
                        <select className="roles" value={role} onChange={(e)=> setRole(e.target.value)}>
                            <option value="">Select a Role</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <div className="input">
                        <i className="material-icons">school</i>
                        <input 
                            type="text" 
                            placeholder="University"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="sign-up">Sign Up</button>
                <a className="redirect-login" href="/login">Already Have an Account?</a>
                {formError && <div className="error">{formError}</div>}
            </form> 
        </div>
    )
}

export default Signup; 