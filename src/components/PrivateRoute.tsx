import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = () => {
    const userLogin = localStorage.getItem('userLogin');
    if (!userLogin) return false;
    
    const userData = JSON.parse(userLogin);
    return userData.isLoggedIn;
  };

  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;