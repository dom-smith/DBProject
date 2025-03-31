import React from 'react'; 
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Pages
import SignupPage from './components/Signup/SignupForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/sign-up" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
