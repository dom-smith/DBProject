import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/SupabaseClient";
import useCurrentUser from "../hooks/useCurrentUser";
import NavBar from "../components/Navbar";
import "./Signup-Login.css";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useCurrentUser();
  const [formError, setFormError] = useState(null);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  // For dropdowns:
  const [rsoName, setRsoName] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // State for dropdown options
  const [categories, setCategories] = useState([]);
  const [rsos, setRsos] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch event categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("event_categories").select("*");
      if (error) {
        console.error("Error fetching event categories:", error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  // Fetch RSOs from the database (optionally you can filter by the admin's university)
  useEffect(() => {
    const fetchRSOs = async () => {
      const { data, error } = await supabase.from("rsos").select("*");
      if (error) {
        console.error("Error fetching RSOs:", error);
      } else {
        setRsos(data);
      }
    };
    fetchRSOs();
  }, [currentUser]);

  // Fetch locations for dropdown
  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from("locations").select("*");
      if (error) {
        console.error("Error fetching locations:", error);
      } else {
        setLocations(data);
      }
    };
    fetchLocations();
  }, []);

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

    if (
      !eventName.trim() ||
      !description.trim() ||
      !eventDate ||
      !eventTime ||
      !contactPhone.trim() ||
      !contactEmail.trim() ||
      !rsoName.trim() ||
      !eventCategory.trim() ||
      !selectedLocation.trim()
    ) {
      setFormError("Please fill in all fields.");
      return;
    }

    // Combine the date and time into a single datetime value
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    if (isNaN(eventDateTime)) {
      setFormError("Invalid date or time.");
      return;
    }

    // Get the current session to retrieve the user ID.
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      setFormError("User session error. Please log in.");
      return;
    }
    const userId = session.user.id;

    // Fetch the rso_id for the selected RSO name.
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

    // Insert a new event including combined datetime, selected category, and location.
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name: eventName,
          description,
          event_datetime: eventDateTime, // Combined date and time
          contact_phone: contactPhone,
          contact_email: contactEmail,
          created_by: userId,
          rso_id: rsoData.rso_id,
          category_id: eventCategory, // Selected event category ID
          location_id: selectedLocation, // Selected location ID
          visibility: 'rso',
          is_approved: true 
        }
      ]);
    if (error) {
      console.error("Error creating event:", error);
      setFormError(error.message);
      return;
    }
    console.log("Event created successfully:", data);
    alert("Event created successfully!");
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
            {/* Dropdown for selecting event category */}
            <div className="input">
              <i className="material-icons">category</i>
              <select 
                className="roles"
                value={eventCategory} 
                onChange={(e) => setEventCategory(e.target.value)}
              >
                <option className="dropdown-option" value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} className="dropdown-option" value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            {/* Dropdown for selecting the RSO */}
            <div className="input">
              <i className="material-icons">group</i>
              <select 
                className="roles"
                value={rsoName} 
                onChange={(e) => setRsoName(e.target.value)}
              >
                <option className="dropdown-option" value="">Select RSO</option>
                {rsos.map(rso => (
                  <option key={rso.rso_id} className="dropdown-option" value={rso.name}>
                    {rso.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Dropdown for selecting a Location */}
            <div className="input">
              <i className="material-icons">location_on</i>
              <select 
                className="roles"
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option className="dropdown-option" value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.location_id} className="dropdown-option" value={loc.location_id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="sign-up">Create Event</button>
            <div className="forgot-login-container">
              <a href="/">Back to Dashboard</a>
            </div>
          </div>
          {formError && <div className="error">{formError}</div>}
        </form>
      </div>
    </>
  );
};

export default CreateEvent;
