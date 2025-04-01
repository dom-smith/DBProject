import React, { useState, useEffect, useRef } from "react"; 
import "./DropdownMenu.css";

const DropdownMenu = ({ inputName, inputData, onSelect }) => {
    const [input, setInput] = useState("");
    const [filteredInput, setFilteredInput] = useState([]);
    const dropdownRef = useRef(null);

    const handleChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (value === "") {
            setFilteredInput([]);
        } else if (inputData) {
            setFilteredInput(
                inputData.filter((data) =>
                    data.toLowerCase().includes(value.toLowerCase())
                )
            );
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setFilteredInput([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectInput = (data) => {
        setInput(data);
        setFilteredInput([]);
        if (onSelect) {
            onSelect(data); // Call the parent function to update state
        }
    };

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
};

export default DropdownMenu;
