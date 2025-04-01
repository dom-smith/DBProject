import React, { useState } from "react"; 
import "./DropdownMenu.css";

// const university = [
//     "University of Central Florida",
//     "University of Florida",
//     "Florida State University",
//     "University of Miami",
//     "Stanford University",
//     "Harvard University",
//     "Massachusetts Institute of Technology",
//     "California Institute of Technology",
//     "Princeton University",
//     "Yale University",
//     "Columbia University",
//     "University of Chicago"
// ];

// shows a dropdown menu of options given a list of options: items
const DropdownMenu = ({ inputName, inputData }) => {
    const [input, setInput] = useState("")
    const [filteredInput, setFilteredInput] = useState([]); 

    const handleChange = (e) => {
        const value = e.target.value; 
        setInput(value); 

        if (value === "") {
            setFilteredInput([]); 
        } 
        if (inputData){
            setFilteredInput(
                inputData.filter((data) => 
                    data.toLowerCase().includes(value.toLowerCase()))
            ); 
        } else {
            return; 
        }
    }

    const selectInput = (data) => {
        setInput(data);
        setFilteredInput([]); 
    }

    return (
        <div className="dropdown-container">
            <div className="input-container">
                <i className="material-icons">school</i>
                <input 
                    type="text" 
                    className="input-field" 
                    value={input}
                    onChange={handleChange}
                    placeholder={inputName}
                />
            </div>
            {filteredInput.length > 0 && (
                <ul className="dropdown-list">
                    {filteredInput.slice(0, 5).map((data, index) => (
                        <li 
                            className="dropdown-item"
                            key={index}
                            onClick={() => selectInput(data)}
                        >
                            {data}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DropdownMenu;