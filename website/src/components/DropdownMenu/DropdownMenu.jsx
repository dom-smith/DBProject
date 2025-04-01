import React, { useState, useEffect, useRef } from "react"; 
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
    const dropdownRef = useRef(null); 

    const handleChange = (e) => {
        const value = e.target.value; 
        setInput(value); 

        if (value === "") {
            setFilteredInput([]); 
        } else  if (inputData){
            setFilteredInput(
                inputData.filter((data) => 
                    data.toLowerCase().includes(value.toLowerCase()))
            ); 
        } 
    }

    // detect click outside of dropdown menu to hide the menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setFilteredInput([]);               // sets menu to empty to hide it
            }
        };

        document.addEventListener("mousedown", handleClickOutside); 
        return () => {
            document.removeEventListener("mousedown", handleClickOutside); 
        }
    }, []);

    const selectInput = (data) => {
        setInput(data);
        setFilteredInput([]); 
    }

    return (
        <div className="dropdown-container" ref={dropdownRef}>
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