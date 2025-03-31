import supabase from "../config/SupabaseClient";
import { useEffect, useState } from "react";

import SignupForm from "../components/Signup/SignupForm";

const SignupPage = () => {
    const[name, setName] = useState('');
    const [method, setMethod] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [role, setRole] = useState(''); 
    const [formError, setFormError] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault(); 
    }

    return (
        <div className="sign-up">
            <SignupForm>

            </SignupForm>
        </div>
    )
}

export default SignupPage; 