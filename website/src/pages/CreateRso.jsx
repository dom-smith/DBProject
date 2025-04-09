import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import "./Signup-Login.css";

const CreateRso = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState(null);
  const [rsoName, setRsoName] = useState("");

  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        navigate("/"); // Not logged in
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (userError || !userData) {
        navigate("/"); // User not found
        return;
      }

      if (userData.role === "admin" || userData.role === "super_admin") {
        setAuthorized(true);
      } else {
        navigate("/"); // Not authorized
      }

      setLoading(false);
    };

    checkRole();
  }, [navigate]);

  const handleCreateRso = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!rsoName.trim()) {
      setFormError("RSO name is required.");
      return;
    }

    const { error } = await supabase.from("rsos").insert([{ name: rsoName, is_active: true }]);

    if (error) {
      console.error("Error creating RSO:", error);
      setFormError("Failed to create RSO. Try again.");
    } else {
      alert("RSO created successfully!");
      setRsoName("");
    }
  };

  if (loading) return <div className="container">Checking authorization...</div>;

  return authorized ? (
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
        </div>

        {formError && <div className="error">{formError}</div>}
      </form>
    </div>
  ) : null;
};

export default CreateRso;
