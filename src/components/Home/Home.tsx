import React, { useState } from 'react';
import Layout from '../Layout/Layout';
import './Home.css';
import Activities from '../Activities/Activities';
import Team from '../Team/Team';
import Reports from '../Reports/Reports';
import Scales from '../Scales/Scales';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUsers, 
  faTasks, 
  faChartBar, 
  faCog, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';
import Settings from '../Settings/Settings';

interface HomeProps {
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = React.useState('scales');
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('Almar 027');

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCompanyName(settings.companyName || 'Almar 027');
    }
  }, []);

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleActivitySaved = () => {
    setCurrentPage('scales');
  };

  const renderContent = () => {
    switch(currentPage) {
      case 'scales':
        return <Scales />;
      case 'activities':
        return <Activities onActivitySaved={handleActivitySaved} />;
      case 'team':
        return <Team />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Scales />;
    }
  };

  return (
    <div className="home-container">
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>{companyName}</h1>
        </div>
        <nav className="home-nav">
          <button 
            className={`nav-button ${currentPage === 'scales' ? 'active' : ''}`}
            onClick={() => handleNavClick('scales')}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            Escalas
          </button>
          <button 
            className={`nav-button ${currentPage === 'team' ? 'active' : ''}`}
            onClick={() => handleNavClick('team')}
          >
            <FontAwesomeIcon icon={faUsers} />
            Equipes
          </button>
          <button 
            className={`nav-button ${currentPage === 'activities' ? 'active' : ''}`}
            onClick={() => handleNavClick('activities')}
          >
            <FontAwesomeIcon icon={faTasks} />
            Atividades
          </button>
          <button 
            className={`nav-button ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}
          >
            <FontAwesomeIcon icon={faChartBar} />
            Relatórios
          </button>

          <button 
            className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <FontAwesomeIcon icon={faCog} />
            Configurações
          </button>

          <button 
            className="nav-button logout"
            onClick={onLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Sair
          </button>
        </nav>
      </aside>
      <main className="home-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Home;