import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import './InstructorView.css';

interface Scale {
  id: number;
  activityName: string;
  date: string;
  time: string;
  team: {
    id: number;
    name: string;
    role: string;
    payment: number;
  }[];
  status: 'active' | 'cancelled';
}

const InstructorView: React.FC = () => {
  const [groupedScales, setGroupedScales] = useState<{ [key: string]: Scale[] }>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAllScales, setShowAllScales] = useState(false);

  useEffect(() => {
    const savedScales = JSON.parse(localStorage.getItem('scales') || '[]');
    const activeScales = savedScales.filter((scale: Scale) => scale.status !== 'cancelled');
    
    // Group scales by date
    const grouped = activeScales.reduce((acc: { [key: string]: Scale[] }, scale: Scale) => {
      const date = scale.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(scale);
      return acc;
    }, {});

    setGroupedScales(grouped);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const filteredScales = selectedDate
    ? { [selectedDate]: groupedScales[selectedDate] || [] }
    : groupedScales;
  
  return (
    <Layout>
      <div className="instructor-content">
        <div className="date-filter">
          <h2>Escalas</h2>
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`date-input ${showAllScales ? 'hide-input' : ''}`}
            />
          </div>
        </div>

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
          filteredScales[selectedDate]?.length > 0 ? (
            <div className="scales-grid">
              {filteredScales[selectedDate].map(scale => (
                <div key={scale.id} className="scale-card">
                  <div className="scale-header">
                    <div className="activity-info">
                      <h3>{scale.activityName}</h3>
                      <span className="scale-time">
                        Horário: {scale.time}
                      </span>
                    </div>
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
    </Layout>
  );
};

export default InstructorView;