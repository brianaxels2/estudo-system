import React from 'react';
import './Notification.css';
interface NotificationProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'error';
}

const Notification: React.FC<NotificationProps> = ({ message, isVisible, type = 'success' }) => {
  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;
