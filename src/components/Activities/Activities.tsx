import React from 'react';
import './Activities.css';
import Notification from '../Notification/Notification';

interface ActivitiesProps {
  onActivitySaved: () => void;
}

interface Activity {
  id: number;
  name: string;
  time: string;
}

const Activities: React.FC<ActivitiesProps> = ({ onActivitySaved }) => {
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [newActivity, setNewActivity] = React.useState({ name: '', time: '' });
  const [selectedActivity, setSelectedActivity] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState('');
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('');
  const [payment, setPayment] = React.useState('');
  const [showNotification, setShowNotification] = React.useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<any[]>([]);
  const [isActivitySaved, setIsActivitySaved] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    // Load activities from localStorage
    const savedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    setActivities(savedActivities);

    // Load team members from localStorage
    const savedTeamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    setTeamMembers(savedTeamMembers);
  }, []);

  // Update the handleDeleteActivity function
  const handleDeleteActivity = (id: number) => {
    const updatedActivities = activities.filter(activity => activity.id !== id);
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
  };

  const handleSaveActivity = (activityData: any) => {
    onActivitySaved();
  };

  const handleActivitySelection = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for duplicate activities
    const existingActivities = JSON.parse(localStorage.getItem('activities') || '[]');
    const isDuplicate = existingActivities.some(
      (activity: Activity) => activity.name.toLowerCase() === newActivity.name.toLowerCase()
    );

    if (isDuplicate) {
      setShowNotification(true);
      setIsActivitySaved(false);
      setTimeout(() => setShowNotification(false), 2500);
      return;
    }

    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    const activityToAdd = {
      id: newId,
      name: newActivity.name,
      time: newActivity.time
    };
    
    const updatedActivities = [...activities, activityToAdd];
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    setNewActivity({ name: '', time: '' });
    setIsModalOpen(false);
    setIsActivitySaved(true);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setIsActivitySaved(false);
    }, 2500);
  };

  const handleRoleSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    if (selectedMember && e.target.value && payment) {
      const memberToAdd = teamMembers.find(m => m.id.toString() === selectedMember);
      if (memberToAdd) {
        setSelectedTeamMembers([...selectedTeamMembers, {
          id: memberToAdd.id,
          name: memberToAdd.name,
          role: e.target.value,
          payment: payment ? parseFloat(payment) : 0
        }]);
        
        // Reset selections
        setSelectedMember('');
        setSelectedRole('');
        setPayment('');  // Reset payment after adding member
      }
    }
  };

  const handleScaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
            
    if (!selectedActivity) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
      return;
    }
  
    if (!selectedDate) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
      return;
    }

    // Check for duplicate activities on the same date
    const existingScales = JSON.parse(localStorage.getItem('scales') || '[]');
    const selectedActivityData = activities.find(a => a.id.toString() === selectedActivity);
    
    const isDuplicate = existingScales.some(
      (scale: any) => 
        scale.date === selectedDate && 
        scale.activityName === selectedActivityData?.name &&
        scale.status !== 'cancelled'
    );

    if (isDuplicate) {
      setIsActivitySaved(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
      return;
    }

    if (selectedTeamMembers.length === 0) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
      return;
    }

    const membersList = document.querySelector('.members-list');
    const membersItems = membersList?.querySelectorAll('.member-item') || [];
    
    if (membersItems.length > 0) {
      const selectedActivityData = activities.find(a => a.id.toString() === selectedActivity);
      
      const newScale = {
        id: Date.now(),
        activityName: selectedActivityData?.name || '',
        time: selectedActivityData?.time || '',
        date: selectedDate || new Date().toISOString().split('T')[0],
        team: selectedTeamMembers,
        totalPayment: selectedTeamMembers.reduce((sum, member) => sum + member.payment, 0),
        status: 'active'
      };
  
      const existingScales = JSON.parse(localStorage.getItem('scales') || '[]');
      const updatedScales = [...existingScales, newScale];
      localStorage.setItem('scales', JSON.stringify(updatedScales));
  
      // Show success notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
  
      // Reset form
      setSelectedActivity('');
      setSelectedMember('');
      setSelectedDate('');
      setSelectedRole('');
      setPayment('');
      setSelectedTeamMembers([]);
      setIsActivitySaved(true);  // Adiciona esta linha
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setIsActivitySaved(false);  // Reseta o estado
      }, 2500);
      return;
    }
  
    // Show error notification if no members
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2500);
  };

  return (
    <div className="activities-container">
      {showNotification && (
        <Notification 
          message={isActivitySaved
            ? "Atividade cadastrada com sucesso!"
            : !selectedActivity
              ? "Por favor, selecione uma atividade"
              : !selectedDate
                ? "Por favor, selecione uma data"
                : selectedTeamMembers.length === 0
                  ? "Por favor, adicione pelo menos um funcionário à equipe"
                  : "Já existe uma atividade cadastrada para esta data!"
          }
          isVisible={showNotification}
          type={isActivitySaved ? "success" : "error"}
        />
      )}
      
      <div className="activities-header">
        <h2>Atividades</h2>
        
        <button className="add-activity-btn" onClick={() => setIsModalOpen(true)}>
            + Nova Atividade
          </button>
      </div>

      <div className="activities-content">
        <div className="activities-list-section">
          <div className="dropdown-container">
            <button 
              className="dropdown-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Lista de Atividades <div>{isDropdownOpen ? '▼' : '▶'}</div>
            </button>
            
            {isDropdownOpen && (
              <div className="activities-list">
                {activities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div>
                      <span className="activity-name">{activity.name}</span>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <div className="activity-actions">
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="team-scaling-section">
          <h3>Escalar Equipe</h3>
          <form className="scaling-form" onSubmit={handleScaleSubmit}>
            <div className="form-group">
              <label>Atividade</label>
              <select 
                value={selectedActivity}
                onChange={(e) => handleActivitySelection(e.target.value)}
              >
                <option value="">Selecione uma atividade</option>
                {activities.map(activity => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name} - {activity.time}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Data da Escala</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Funcionário</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              >
                <option value="">Selecione um funcionário</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Valor</label>
              <input
                type="number"
                placeholder="R$ 0,00"
                step="0.01"
                min="0"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Função</label>
              <select 
                value={selectedRole}
                onChange={handleRoleSelection}
              >
                <option value="">Selecione a função</option>
                <option value="leader">Líder</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div className="selected-members">
              <h4>Funcionários Selecionados</h4>
              {selectedTeamMembers.length > 0 ? (
                <ul className="members-list">
                  {selectedTeamMembers.map((member, index) => (
                    <li key={index} className="member-item">
                      <span>{member.name} - {member.role === 'leader' ? 'Líder' : 'Normal'}</span>
                      <button
                        type="button"
                        className="remove-member"
                        onClick={() => {
                          const updatedMembers = selectedTeamMembers.filter((_, i) => i !== index);
                          setSelectedTeamMembers(updatedMembers);
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum funcionário selecionado</p>
              )}
            </div>

            <button type="submit" className="scale-team-btn">Escalar</button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nova Atividade</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Horário</label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
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
  );
};

export default Activities;