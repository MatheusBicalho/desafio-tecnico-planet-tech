// /frontend/src/App.js - CÓDIGO CORRIGIDO
import React, { useContext } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import { AppContext } from './context/AppContext';

// 👈 NOVO: Importe o arquivo CSS
import './styles/App.css'; 

function App() {
  const { user } = useContext(AppContext);

  return (
    <div className="App">
      {user ? <Chat /> : <Login />}
    </div>
  );
}

export default App;