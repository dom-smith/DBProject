import React from 'react'; 
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
