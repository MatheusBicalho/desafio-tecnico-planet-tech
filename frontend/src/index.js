// /frontend/src/index.js - CÓDIGO CORRIGIDO FINAL

import React from 'react';
import ReactDOM from 'react-dom/client';
// IMPORT DO CSS REMOVIDO PARA EVITAR O ERRO 'Module not found: Error: Can't resolve ./index.css'
import App from './App';
import { AppProvider } from './context/AppContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider> 
      <App />
    </AppProvider>
  </React.StrictMode>
);

// Se precisar de estilos, você pode importá-los diretamente no App.js ou no componente.