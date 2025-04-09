import React from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/SupabaseClient';

const NavBar = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error("Logout error:", error);
    }
  };

  return (
    <header style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd'
    }}>
      <div>
        <h2>Event Manager</h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: '#3f51b5', 
          color: 'white', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginRight: '10px', 
          fontWeight: 'bold'
        }}>
          {currentUser.name.charAt(0)}
        </div>
        <div style={{ marginRight: '20px' }}>{currentUser.name}</div>
        <button 
          onClick={handleLogout} 
          style={{ 
            backgroundColor: '#1da1f2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default NavBar;
