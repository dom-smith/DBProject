import React, { useState } from "react"; 
import "./UniversityDropdown.css";

const universities = [
    "University of Central Florida",
    "University of Florida",
    "Florida State University",
    "University of Miami",
    "Stanford University",
    "Harvard University",
    "Massachusetts Institute of Technology",
    "California Institute of Technology",
    "Princeton University",
    "Yale University",
    "Columbia University",
    "University of Chicago"
];

// shows a dropdown menu of options given a list of options: items
const UniversityDropdown = () => {
    const [university, setUniversity] = useState("")
    const [filteredUniversities, setFilteredUniversities] = useState([]); 

    const handleChange = (e) => {
        const value = e.target.value; 
        setUniversity(value); 

        if (value === "") {
            setFilteredUniversities([]); 
        } else {
            setFilteredUniversities(
                universities.filter((uni) => 
                    uni.toLowerCase().includes(value.toLowerCase()))
            ); 
        }
    }

    const selectUniversity = (uni) => {
        setUniversity(uni);
        setFilteredUniversities([]); 
    }

    return (
        <div className="dropdown-container">
            <div className="input-container">
                <i className="material-icons">school</i>
                <input 
                    type="text" 
                    className="input-field" 
                    value={university}
                    onChange={handleChange}
                    placeholder="University"
                />
            </div>
            {filteredUniversities.length > 0 && (
                <ul className="dropdown-list">
                    {filteredUniversities.slice(0, 5).map((uni, index) => (
                        <li 
                            className="dropdown-item"
                            key={index}
                            onClick={() => selectUniversity(uni)}
                        >
                            {uni}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UniversityDropdown;