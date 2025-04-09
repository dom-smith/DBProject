import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import useCurrentUser from "../hooks/useCurrentUser";
import NavBar from "./NavBar"; // Adjust the import path as needed
import "./Signup-Login.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useCurrentUser();
  const [formError, setFormError] = useState(null);

  // Form state
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [rsoName, setRsoName] = useState("");

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.role !== "admin") {
        navigate("/");
      }
    }
  }, [loading, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate that required fields are filled
    if (
      !eventName.trim() ||
      !description.trim() ||
      !eventDate ||
      !eventTime ||
      !contactPhone.trim() ||
      !contactEmail.trim() ||
      !rsoName.trim()
    ) {
      setFormError("Please fill in all fields.");
      return;
    }

    // Get the current session to obtain the user id.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setFormError("User session error. Please log in.");
      return;
    }
    const userId = session.user.id;

    // Look up the RSO id from the rsos table given the rsoName.
    const { data: rsoData, error: rsoError } = await supabase
      .from("rsos")
      .select("rso_id")
      .eq("name", rsoName)
      .single();

    if (rsoError || !rsoData) {
      console.error("Error fetching RSO:", rsoError);
      setFormError("RSO not found. Please check the RSO name.");
      return;
    }
    
    // Insert the event.
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name: eventName,
          description,
          date: eventDate,
          time: eventTime,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          created_by: userId,
          rso_id: rsoData.rso_id,
          visibility: 'rso',
          is_approved: false // New events default to not approved
        }
      ]);
    if (error) {
      console.error("Error creating event:", error);
      setFormError(error.message);
      return;
    }
    console.log("Event created successfully:", data);
    alert("Event created successfully! It will be visible once approved.");
    navigate("/");
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <>
      <NavBar currentUser={currentUser} />
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <div className="text">Create Event</div>
            <div className="underline"></div>
          </div>

          <div className="inputs">
            <div className="input">
              <i className="material-icons">event</i>
              <input 
                type="text" 
                placeholder="Event Name" 
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">description</i>
              <input 
                type="text" 
                placeholder="Description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">calendar_today</i>
              <input 
                type="date" 
                placeholder="Event Date" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">access_time</i>
              <input 
                type="time" 
                placeholder="Event Time" 
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">phone</i>
              <input 
                type="text" 
                placeholder="Contact Phone" 
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">mail</i>
              <input 
                type="email" 
                placeholder="Contact Email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="input">
              <i className="material-icons">group</i>
              <input 
                type="text" 
                placeholder="RSO Name" 
                value={rsoName}
                onChange={(e) => setRsoName(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="sign-up">Create Event</button>
          <div className="forgot-login-container">
            <a href="/">Back to Home</a>
          </div>
          {formError && <div className="error">{formError}</div>}
        </form>
      </div>
    </>
  );
};

export default CreateEvent;
