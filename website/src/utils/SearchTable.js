import { data } from "react-router-dom";
import supabase from "./SupabaseClient";
import React, { useEffect, useState } from "react";

// Given a table and return all names 

const SearchTable = (tableName, columnName) => {
    const fetchData = async () => {
        const {data, error} = await supabase
        .from(tableName)
        .select(columnName); 
        if (error) {
            console.log(error); 
        } else {
            return data; 
        }
        return; 
    }
    fetchData();
}

export default SearchTable;