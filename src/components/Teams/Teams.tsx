import React, { useState, useEffect } from 'react';
import './Teams.css';
import Notification from '../Notification/Notification';

interface TeamMember {
  id: number;
  name: string;
  role: string;
}

interface Scale {
  id: number;
  activityName: string;
  date: string;
  time: string;
  team: {
    id: number;
    name: string;
    role: string;
  }[];
  status: string;
}

const Teams: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberActivities, setMemberActivities] = useState<{ [key: number]: Scale[] }>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  useEffect(() => {
    const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    const savedScales = JSON.parse(localStorage.getItem('scales') || '[]');
    
    setTeamMembers(savedMembers);

    // Group activities by team member
    const activitiesByMember = savedMembers.reduce((acc: { [key: number]: Scale[] }, member: TeamMember) => {
      acc[member.id] = savedScales.filter((scale: Scale) => 
        scale.status !== 'cancelled' && 
        scale.team.some(teamMember => teamMember.id === member.id)
      );
      return acc;
    }, {});

    setMemberActivities(activitiesByMember);
  }, []);

  const showNotificationMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberRole) {
      const newMember = {
        id: Date.now(),
        name: newMemberName,
        role: newMemberRole
      };
      
      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
      
      setNewMemberName('');
      setNewMemberRole('');
      
      showNotificationMessage('Colaborador adicionado com sucesso!');
      setNotificationType('success');

      // Update member activities
      const savedScales = JSON.parse(localStorage.getItem('scales') || '[]');
      const activitiesByMember = updatedMembers.reduce((acc: { [key: number]: Scale[] }, member: TeamMember) => {
        acc[member.id] = savedScales.filter((scale: Scale) => 
          scale.status !== 'cancelled' && 
          scale.team.some(teamMember => teamMember.id === member.id)
        );
        return acc;
      }, {});
      setMemberActivities(activitiesByMember);

      // Hide notification after delay
      setTimeout(() => {
        setShowNotification(false);
      }, 2500);
    }
  };

  const handleDeleteMember = (id: number) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
    localStorage.setItem('teamMembers', JSON.stringify(updatedMembers));
    
    // Atualiza notificação
    setNotificationMessage('Colaborador excluído com sucesso!');
    setNotificationType('success');
    setShowNotification(true);
    
    // Atualiza activities após exclusão
    const activitiesByMember = updatedMembers.reduce((acc: { [key: number]: Scale[] }, member: TeamMember) => {
      acc[member.id] = memberActivities[member.id] || [];
      return acc;
    }, {});
    setMemberActivities(activitiesByMember);

    // Esconde notificação após 2.5 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 2500);
  };

  return (
    <div className="teams-container">
      <Notification
        message={notificationMessage}
        type={notificationType}
        isVisible={showNotification}
      />
      <h2>Equipes</h2>
      
      <form onSubmit={handleAddMember} className="add-member-form">
        <input
          type="text"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          placeholder="Nome do colaborador"
          required
        />
        <input
          type="text"
          value={newMemberRole}
          onChange={(e) => setNewMemberRole(e.target.value)}
          placeholder="Função"
          required
        />
        <button type="submit">Adicionar Colaborador</button>
      </form>
      
      <div className="team-members-grid">
        {teamMembers.map(member => (
          <div key={member.id} className="team-member-card">
            <div className="member-info">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
            <div className="member-activities">
              <h4>Atividades:</h4>
              {memberActivities[member.id]?.length > 0 ? (
                <div className="activities-list">
                  {memberActivities[member.id].map((scale) => (
                    <div key={scale.id} className="activity-item">
                      <span className="activity-name">{scale.activityName}</span>
                      <span className="activity-date">
                        {new Date(scale.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="activity-time">{scale.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-activities">Sem atividades agendadas</p>
              )}
            </div>
            <button 
              className="delete-button"
              onClick={() => handleDeleteMember(member.id)}
              type="button"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;