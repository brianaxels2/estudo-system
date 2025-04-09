import React, { useState, useEffect } from 'react';
import './Settings.css';
import Notification from '../Notification/Notification';

interface SettingsData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultCurrency: string;
  timeFormat: string;
}

const Settings: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState<SettingsData>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    defaultCurrency: 'BRL',
    timeFormat: '24h'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
      setNotificationMessage('Configurações salvas com sucesso!');
      setNotificationType('success');
      setShowNotification(true);
      
      // Força um reload da página para atualizar o sidebar
      window.location.reload();
      
      setTimeout(() => setShowNotification(false), 2500);
    } catch (error) {
      setNotificationMessage('Erro ao salvar as configurações');
      setNotificationType('error');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="settings-container">
      <h2>Configurações</h2>
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3>Informações da Empresa</h3>
          <div className="form-group">
            <label>Nome da Empresa</label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              placeholder="Digite o nome da empresa"
            />
          </div>
        </div>


        <button type="submit" className="save-settings-btn">
          Salvar Configurações
        </button>
      </form>

      {showNotification && (
        <Notification
          message={notificationMessage}
          isVisible={showNotification}
          type={notificationType}
        />
      )}
    </div>
  );
};

export default Settings;