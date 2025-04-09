import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="toggle-button" onClick={onToggle}>
        {isOpen ? '◄' : '►'}
      </button>
      <nav className="nav-menu">
        <ul>
          <li>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </li>
          <li>
            <i className="fas fa-calendar-alt"></i>
            <span>Escalas</span>
          </li>
          <li>
            <i className="fas fa-users"></i>
            <span>Funcionários</span>
          </li>
          <li>
            <i className="fas fa-tasks"></i>
            <span>Atividades</span>
          </li>
          <li>
            <i className="fas fa-chart-bar"></i>
            <span>Relatórios</span>
          </li>
          <li>
            <i className="fas fa-cog"></i>
            <span>Configurações</span>
          </li>
          <li className="logout">
            <i className="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;