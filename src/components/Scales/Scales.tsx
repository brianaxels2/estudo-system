import React, { useState, useEffect } from 'react';
import './Scales.css';
import Notification from '../Notification/Notification';

// Primeiro, atualize a interface Scale
interface Scale {
  id: number;
  activityName: string;
  date: string;
  team: {
    id: number;
    name: string;
    role: string;  // Alterado de isLeader: boolean
    payment: number;  // Adicionado payment
  }[];
  payment: number;
  time: string;
  status?: 'active' | 'cancelled';
}

// Adicione esta interface no início do arquivo, junto com a interface Scale
interface Activity {
  id: number;
  name: string;
  // outros campos necessários
}

// Add this function before the Scales component
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const Scales: React.FC = () => {
  const [scales, setScales] = useState<Scale[]>([]);
  const [groupedScales, setGroupedScales] = useState<{ [key: string]: Scale[] }>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('error');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activities, setActivities] = useState<Activity[]>([]); // Added missing state
  const [showAllScales, setShowAllScales] = useState(false);

  useEffect(() => {
    // Carregar atividades do localStorage
    const savedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    setActivities(savedActivities);

    // Carregar escalas do localStorage
    const savedScales = JSON.parse(localStorage.getItem('scales') || '[]');
    const activeScales = savedScales.filter((scale: Scale) => scale.status !== 'cancelled');
    setScales(activeScales);
    updateGroupedScales(activeScales);
  }, []);

  const handleCancelScale = (id: number) => {
    const allScales = JSON.parse(localStorage.getItem('scales') || '[]');
    const updatedScales = allScales.map((scale: Scale) => 
      scale.id === id ? { ...scale, status: 'cancelled' } : scale
    );
    
    localStorage.setItem('scales', JSON.stringify(updatedScales));
    const activeScales = updatedScales.filter((scale: Scale) => scale.status !== 'cancelled');
    setScales(activeScales);
    updateGroupedScales(activeScales);
    
    setNotificationMessage('Escala cancelada com sucesso!');
    setNotificationType('success');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  const updateGroupedScales = (scales: Scale[]) => {
    const grouped = scales.reduce((acc: { [key: string]: Scale[] }, scale: Scale) => {
      const date = scale.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(scale);
      return acc;
    }, {});

    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .reduce((acc: { [key: string]: Scale[] }, date) => {
        acc[date] = grouped[date];
        return acc;
      }, {});

    setGroupedScales(sortedGrouped);
  };

  const filteredGroupedScales = {
    [selectedDate]: groupedScales[selectedDate] || []
  };

  return (
    <div className="scales-container">
      <div className="scales-header">
        <h2>Escalas</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`date-input ${showAllScales ? 'hide-input' : ''}`}
          />
      </div>

      {showNotification && (
        <Notification
          message={notificationMessage}
          isVisible={showNotification}
          type={notificationType}
        />
      )}

      <div className="scales-content">
        {showAllScales ? (
          Object.entries(groupedScales)
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, scales]) => (
              <div key={date} className="date-group">
                <h3 className="date-header">{formatDate(date)}</h3>
                <div className="scales-grid">
                  {scales.map(scale => (
                    <div key={scale.id} className="scale-card">
                      <div className="scale-header">
                        <div className="activity-info">
                          <h3>{scale.activityName}</h3>
                          <span className="scale-time">
                            Horário: {scale.time}
                          </span>
                        </div>
                        <button 
                          className="delete-scale-btn"
                          onClick={() => handleCancelScale(scale.id)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="team-members">
                        <h4 className="team-section-title">Equipe:</h4>
                        {scale.team
                          .filter(member => member.role === 'leader')
                          .map(member => (
                            <div key={member.id} className="team-member leader">
                              <div className="member-info">
                                <span className="member-name">{member.name}</span>
                                <span className="leader-indicator">Líder</span>
                              </div>
                            </div>
                          ))}
                        {scale.team
                          .filter(member => member.role !== 'leader')
                          .map(member => (
                            <div key={member.id} className="team-member">
                              <div className="member-info">
                                <span className="member-name">{member.name}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          filteredGroupedScales[selectedDate]?.length > 0 ? (
            <div className="scales-grid">
              {filteredGroupedScales[selectedDate].map(scale => (
                <div key={scale.id} className="scale-card">
                  <div className="scale-header">
                    <div className="activity-info">
                      <h3>{scale.activityName}</h3>
                      <span className="scale-time">
                        Horário: {scale.time}
                      </span>
                    </div>
                    <button 
                      className="delete-scale-btn"
                      onClick={() => handleCancelScale(scale.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="team-members">
                    <h4 className="team-section-title">Equipe:</h4>
                    {scale.team
                      .filter(member => member.role === 'leader')
                      .map(member => (
                        <div key={member.id} className="team-member leader">
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="leader-indicator">Líder</span>
                          </div>
                        </div>
                      ))}
                    {scale.team
                      .filter(member => member.role !== 'leader')
                      .map(member => (
                        <div key={member.id} className="team-member">
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                {Object.keys(groupedScales).length === 0 
                  ? 'Nenhuma escala cadastrada'
                  : `Não há escalas cadastradas para ${selectedDate === new Date().toISOString().split('T')[0] ? 'hoje' : formatDate(selectedDate)}`
                }
              </p>
            </div>
          )
        )}
        
        {Object.keys(groupedScales).length > 0 && (
          <button 
            className="toggle-scales-btn"
            onClick={() => setShowAllScales(!showAllScales)}
          >
            {showAllScales ? 'Apenas Data Selecionada' : 'Mostrar Todas Escalas'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Scales;