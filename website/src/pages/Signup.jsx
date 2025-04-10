import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import "./Signup-Login.css"; 

// utils 
import supabase from "../utils/SupabaseClient";

// react components
import DropdownMenu from "../components/DropdownMenu/DropdownMenu";

const roles = ["student", "admin", "super_admin"];

const Signup = () => {
    const navigate = useNavigate();
    const [universities, setUniversities] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState('');
    const [universityName, setUniversityName] = useState(''); 
    const [role, setRole] = useState(''); 
    const [formError, setFormError] = useState(null); 

    useEffect(() => {
        const fetchUniversities = async () => {
            const { data, error } = await supabase.from("universities").select("university_id, name"); 

            if (error) {
                console.error("Error fetching universities from db:", error); 
            } else {
                const universityMap = data.reduce((acc, uni) => {
                    acc[uni.name] = uni.university_id; 
                    return acc;
                }, {});
                setUniversities(universityMap);
            }
        };
        fetchUniversities();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
    
        if (!name || !email || !password || !confirmPassword || !role || !universityName) {
            setFormError('Please fill in all fields correctly');
            return;
        }
    
        if (password !== confirmPassword) {
            setFormError('Passwords must match');
            return;
        }
    
        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    
        if (authError) {
            console.log("Auth Error:", authError);
            setFormError(authError.message);
            return;
        }
    
        console.log("Auth successful", authData);
    
        // Get userId directly from signUp response
        const userId = authData?.user?.id;
    
        if (!userId) {
            setFormError("User ID not found after signup. Check email verification.");
            return;
        }
    
        // Lookup university ID from name
        const universityId = universities[universityName];
        if (!universityId) {
            setFormError("Invalid university selection");
            return;
        }
    
        // Insert user into the users table
        const { data: userData, error: userError } = await supabase
            .from("users")
            .insert([{ user_id: userId, password, name, email, university_id: universityId, role }]);
    
        if (userError) {
            console.log("User table error:", userError);
            setFormError("Error saving user details.");
            return;
        }
    
        console.log("User has been created:", userData);
        
        // Redirect based on role.
        if (role === 'super_admin')  {
            navigate('/create-rso');
        } else if (role === 'admin') {
            navigate('/create-event');
        } else {
            navigate('/');
        }
    };
    
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
                        <DropdownMenu 
                            inputName="Role"
                            inputData={roles}
                            onSelect={(selectedRole) => setRole(selectedRole)}
                        />
                    </div>
                    <div className="input">
                       <DropdownMenu 
                            inputName="University" 
                            inputData={Object.keys(universities)}
                            onSelect={setUniversityName}
                        />
                    </div>
                </div>
                <button type="submit" className="sign-up">Sign Up</button>
                <a className="redirect-login" href="/login">Already Have an Account?</a>
                {formError && <div className="error">{formError}</div>}
            </form> 
        </div>
    );
}

export default Signup;
