import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './MainLayout';
import Login from './components/Signin/Login';
import Signup from './components/Signin/Signup';
import ActiveAccount from './components/Signin/ActiveAccount';
import NotActive from './components/Signin/NotActive';
import logoWhite from './assets/imgs/logos/anita-logo-white.png';
import StartingLoading from './components/Loaders/StartingLoading';


function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true'; // Parse to boolean
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      // Simulate a loading delay
      const timer = setTimeout(() => {
          setLoading(false);
      }, 5000);

      // Cleanup the timer
      return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => {
      const newDarkMode = !prevDarkMode;
      localStorage.setItem('darkMode', newDarkMode); // Store the new mode in localStorage
      return newDarkMode;
    });
  };

  // Effect to update the class on the document element when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (loading) {
      return (<StartingLoading loading={loading} logo={logoWhite} />);
  }

  return (
    <BrowserRouter>
      <div
        className={`${darkMode ? 'dark' : ''} ${darkMode ? 'bg-black' : ''}`}
      >
        <Routes>
          {/* Main layout with NavBar */}
          <Route path="/*" element={ <MainLayout toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> } />
          {/* Routes without NavBar */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="activar" element={<ActiveAccount />} />
          <Route path="/accountnotactive" element={<NotActive />} />
          {/* Add more routes without NavBar here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
