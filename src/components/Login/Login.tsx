import React from 'react';
import './Login.css';

interface LoginProps {
  onLogin: (userType: string) => void;
}

interface Company {
  id: number;
  name: string;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [selectedCompany, setSelectedCompany] = React.useState('');
  const [error, setError] = React.useState('');
  const [savedCompanyName, setSavedCompanyName] = React.useState('');

  // Add useEffect to load company name from settings
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSavedCompanyName(settings.companyName || '');
    }
  }, []);

  // Update companies array to include saved company
  const companies: Company[] = [ 
    { id: 1, name: savedCompanyName }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'almar027' && password === '123456') {
      localStorage.setItem('userRole', 'admin');
      onLogin('user');
    } else if (username === 'instrutor.almar027' && password === '123456') {
      localStorage.setItem('userRole', 'instructor');
      onLogin('instructor');
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form-header">
          <div className="login-icon">👤</div>
          <h2>Bem-vindo</h2>
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Usuário</label>
          <input
            type="text"
            id="username"
            placeholder="Digite seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="company">Empresa</label>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            required
          >
            <option value="">Selecione uma empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button className='login-button' type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;