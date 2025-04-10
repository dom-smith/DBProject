import React from 'react'; 
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Pages
import Signup from './pages/Signup';
import Login from './pages/Login'
import Home from './pages/Home';
import CreateRso from './pages/CreateRso';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/create-rso" element={<CreateRso />} />
        <Route path="/create-event" element={<CreateEvent/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
