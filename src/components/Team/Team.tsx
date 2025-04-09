import React, { useState, useEffect } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps } from 'react-icons/lib';
import { FaUserCircle, FaWhatsapp, FaMoneyBillWave, FaUserPlus, FaTimes } from 'react-icons/fa';
import Notification from '../Notification/Notification';
import './Team.css';

interface TeamMember {
  id: number;
  name: string;
  whatsapp: string;
  pix: string;
}

const Team: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [newMember, setNewMember] = useState({
    name: '',
    whatsapp: '',
    pix: ''
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const savedMembers = localStorage.getItem('teamMembers');
    return savedMembers ? JSON.parse(savedMembers) : [];
  });

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
    }
    return value;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setNewMember({...newMember, whatsapp: formatted});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMembersList = [...teamMembers, {
      id: Date.now(),
      ...newMember
    }];
    setTeamMembers(newMembersList);
    setNewMember({ name: '', whatsapp: '', pix: '' });
    setIsModalOpen(false);
    
    // Show success notification
    setNotificationMessage('Colaborador adicionado com sucesso!');
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const handleDeleteMember = (id: number) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
    
    // Show delete notification
    setNotificationMessage('Colaborador excluído com sucesso!');
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  return (
    <IconContext.Provider value={{}}>
      <div className="team-container">
        <Notification
          message={notificationMessage}
          type={notificationType}
          isVisible={showNotification}
        />
        
        <div className="team-header">
          <h2>Equipe</h2>
          <button className="add-member-btn" onClick={() => setIsModalOpen(true)}>
            {React.createElement(FaUserPlus as React.ComponentType<IconBaseProps>, { size: 20 })} Adicionar
          </button>
        </div>
    
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <div className="member-avatar">
                {React.createElement(FaUserCircle as React.ComponentType<IconBaseProps>, { size: 48 })}
              </div>
              <h3>{member.name}</h3>
              <div className="member-info">
                <p>{React.createElement(FaWhatsapp as React.ComponentType<IconBaseProps>, { size: 16 })} {member.whatsapp}</p>
                <p>{React.createElement(FaMoneyBillWave as React.ComponentType<IconBaseProps>, { size: 16 })} {member.pix}</p>
              </div>
              <button 
                className="delete-member-btn"
                onClick={() => handleDeleteMember(member.id)}
              >
                {React.createElement(FaTimes as React.ComponentType<IconBaseProps>, { size: 16 })} Excluir Colaborador
              </button>
            </div>
          ))}
        </div>
    
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Adicionar Novo Membro</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                  {React.createElement(FaTimes as React.ComponentType<IconBaseProps>, { size: 20 })}
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp</label>
                  <input
                    type="tel"
                    value={newMember.whatsapp}
                    onChange={handleWhatsAppChange}
                    placeholder="(xx) x xxxx-xxxx"
                    maxLength={16}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PIX</label>
                  <input
                    type="text"
                    value={newMember.pix}
                    onChange={(e) => setNewMember({...newMember, pix: e.target.value})}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="submit">Adicionar</button>
                  <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </IconContext.Provider>
  );
};

export default Team;