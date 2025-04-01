import { useEffect, useState } from "react";
import supabase from "./SupabaseClient";

const SearchTable = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("universities")
                .select("name"); 

            if (error) {
                console.log("Error in retrieving data", error);
            } else {
                console.log("Fetched data:", data);
                setData(data); // Store data in state
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <h2>Universities</h2>
            <ul>
                {data.map((uni, index) => (
                    <li key={index}>{uni.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default SearchTable;
