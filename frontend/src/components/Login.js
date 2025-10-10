import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const { login } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (trimmedUsername && trimmedUsername.length <= 50) {
      login(trimmedUsername);
    } else {
      alert('Nome inválido. Digite um nome com até 50 caracteres.');
    }
  };

  return (
  <div className="google-login-wrapper">
  <div className="login-card">
    <div className="logo-section">
      <img src="./images/logo.png" alt="PlanetTech logo"
        className="logo-img"
      />
      <h1>Chat</h1>
    </div>
        
<p className="slogan">
  Conectando informações e oportunidades.
</p>        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              aria-label="Nome do usuário"
              maxLength={50}
              required
            />
            {/* Opcional: Adicionar um rótulo flutuante acima do input (via CSS) */}
          </div>
          
          <div className="action-row"> {/* Linha para alinhamento de botões */}
            {/* Este botão pode ser mantido para "Criar Conta" ou ações secundárias */}
            
            <button type="submit" className="primary-btn" aria-label="Avançar para o chat">
              Avançar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;