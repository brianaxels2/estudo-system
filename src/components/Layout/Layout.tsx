import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Reports from '../Reports/Reports';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('schedule');
  const [companyName, setCompanyName] = useState('Dashboard');
  const navigate = useNavigate();

  // Add this useEffect to load company name from settings
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCompanyName(settings.companyName || 'Dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.setItem('userType', '');
    localStorage.setItem('isAuthenticated', 'false');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Update the click handlers for each button to include sidebar toggle
  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsSidebarOpen(false); // Close sidebar on navigation
  };
  
  return (
    <div className="layout-container">
      <button className="toggle-button" onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>{companyName}</h1>
        </div>
        <nav>
          <button 
            className={`nav-button ${currentView === 'schedule' ? 'active' : ''}`}
            onClick={() => handleNavClick('schedule')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Escalas</span>
          </button>
          <button 
            className="nav-button"
            onClick={() => handleNavClick('employees')}
          >
            <i className="fas fa-users"></i>
            <span>Funcionários</span>
          </button>
          <button className="nav-button">
            <i className="fas fa-tasks"></i>
            <span>Atividades</span>
          </button>
          <button 
            className={`nav-button ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}  // Updated this line
          >
            <i className="fas fa-chart-bar"></i>
            <span>Relatórios</span>
          </button>
          <button className="nav-button">
            <i className="fas fa-cog"></i>
            <span>Configurações</span>
          </button>
          <button className="nav-button logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </button>
        </nav>
      </div>
      <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        {currentView === 'reports' ? <Reports /> : children}
      </main>
    </div>
  );
};

export default Layout;