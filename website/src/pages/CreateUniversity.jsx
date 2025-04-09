import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import "./Signup-Login.css";

const CreateUniversity = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [uniName, setUniName] = useState("");
  const [address, setAddress] = useState(""); // Optional address field

  useEffect(() => {
    const checkRole = async () => {
      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        navigate("/");
        return;
      }

      // Fetch the user row from the users table using the session's user id.
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      if (userError || !userData) {
        navigate("/");
        return;
      }

      // Only allow access if the role is "super_admin"
      if (userData.role === "super_admin") {
        setAuthorized(true);
      } else {
        navigate("/");
      }
      setLoading(false);
    };

    checkRole();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!uniName.trim()) {
      setFormError("Please enter a university name.");
      return;
    }

    // Insert new university record into the database.
    const { data, error } = await supabase
      .from("universities")
      .insert([{ name: uniName, address }]);
    if (error) {
      console.error("Error creating university:", error);
      setFormError(error.message);
      return;
    }
    console.log("University created successfully", data);
    alert("University created successfully!");
    setUniName("");
    setAddress("");
    navigate("/");
  };

  if (loading) return <div className="container">Checking authorization...</div>;
  
  return authorized ? (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="header">
          <div className="text">Create University</div>
          <div className="underline"></div>
        </div>

        <div className="inputs">
          <div className="input">
            <i className="material-icons">school</i>
            <input 
              type="text"
              placeholder="University Name"
              value={uniName}
              onChange={(e) => setUniName(e.target.value)}
            />
          </div>
          <div className="input">
            <i className="material-icons">location_on</i>
            <input 
              type="text"
              placeholder="Address (optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button type="submit" className="sign-up">Create University</button>
        </div>
        {formError && <div className="error">{formError}</div>}
      </form>
    </div>
  ) : null;
};

export default CreateUniversity;
