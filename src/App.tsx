import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import InstructorView from './components/InstructorView/InstructorView';
import Reports from './components/Reports/Reports';

function App() {
  const handleLogin = (userType: string) => {
    if (userType === 'instructor') {
      localStorage.setItem('userType', 'instructor');
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/instructor';
    } else {
      localStorage.setItem('userType', 'user');
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/home';
    }
  };

  const handleLogout = () => {
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.setItem('userType', '');
    window.location.href = '/';
  };

  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType');

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? 
            (userType === 'instructor' ? <Navigate to="/instructor" /> : <Navigate to="/home" />) 
            : <Navigate to="/login" />
        } />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/home" element={<Home onLogout={handleLogout} />} />
        <Route path="/instructor" element={<InstructorView />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
