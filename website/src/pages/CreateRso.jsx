// CreateRso.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import NavBar from "../components/Navbar"; 
import useCurrentUser from "../hooks/useCurrentUser";
import "./Signup-Login.css";

const CreateRso = () => {
  const navigate = useNavigate();
  const [rsoName, setRsoName] = useState('');
  const [formError, setFormError] = useState(null);
  const { currentUser, loading } = useCurrentUser();

  // Redirect if user is not super_admin
  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.role !== 'super_admin') {
        navigate("/");
      }
    }
  }, [loading, currentUser, navigate]);

  const handleCreateRso = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!rsoName.trim()) {
      setFormError("RSO name is required.");
      return;
    }

    // Get the current session.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setFormError("User session error. Please log in.");
      return;
    }
    const userId = session.user.id;

    // Fetch the user's university id.
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("university_id")
      .eq("user_id", userId)
      .single();
    if (userError) {
      setFormError("Error fetching user details.");
      return;
    }

    // Insert new RSO
    const { data, error } = await supabase
      .from("rsos")
      .insert([{ 
        name: rsoName, 
        university_id: userData.university_id, 
        admin_id: userId, 
        is_active: true 
      }]);
    if (error) {
      console.error("Error creating RSO:", error);
      setFormError(error.message);
      return;
    }
    console.log("RSO created successfully", data);
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <>
      <NavBar currentUser={currentUser} />
      <div className="container">
        <form onSubmit={handleCreateRso}>
          <div className="header">
            <div className="text">Create RSO</div>
            <div className="underline"></div>
          </div>
          <div className="inputs">
            <div className="input">
              <i className="material-icons">groups</i>
              <input 
                type="text" 
                placeholder="RSO Name" 
                value={rsoName}
                onChange={(e) => setRsoName(e.target.value)}
              />
            </div>
            <button type="submit" className="sign-up">Create RSO</button>
            <div className="forgot-login-container">
              <a href="/">Back to Home</a>
            </div>
          </div>
          {formError && <div className="error">{formError}</div>}
        </form>
      </div>
    </>
  );
};

export default CreateRso;
