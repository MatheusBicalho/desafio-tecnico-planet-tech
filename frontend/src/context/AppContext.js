// /frontend/src/context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null); // estado global do alerta

  // Poll mensagens a cada 5s
  useEffect(() => {
    if (user) {
    const fetchMessages = async () => {
      try {
        const data = await api.getMessages();
        setMessages(data);
      } catch (error) {
          console.error("Erro ao carregar mensagens:", error);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    }
  }, [user]);

  const login = (username) => setUser(username);
  const logout = () => setUser(null);

  const resetPreview = () => setPreview(null);

  // Função para adicionar mensagem localmente (Optimistic Update)
  const addMessageLocally = (newMessage) => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  // --- NOVO: Lógica para limpar o chat ---
  const clearMessages = () => setMessages([]);

  // ---------- Helpers de alerta/confirm ----------
  const showAlert = (text, type = 'info') => setAlertMessage({ text, type });

  const showConfirm = (text, onConfirm) =>
    setAlertMessage({ text, type: 'confirm', onConfirm });

  // ---------- Reset com confirmação custom ----------
  const handleResetChat = async () => {
    showConfirm(
      'Tem certeza que deseja LIMPAR PERMANENTEMENTE o chat? Isso não pode ser desfeito.',
      async () => {
        try {
              await api.resetChat(); // Chama o endpoint do backend
              clearMessages(); // Limpa imediatamente o estado local (frontend)
              showAlert('Chat limpo com sucesso!', 'info');
        } catch (error) {
          console.error('Falha ao resetar o chat:', error);
          showAlert('Erro ao limpar o chat. Verifique o console e o servidor.', 'error');
        }
      }
    );
  };
  // ----------------------------------------

  const value = {
    user,
    messages,
    preview,
    setPreview,
    login,
    logout,
    resetPreview,
    addMessageLocally,
    clearMessages,
    handleResetChat,
    showAlert,
    showConfirm,
  };

  return (
    <AppContext.Provider value={value}>
      {children}

      {/* ALERTA/CONFIRMAÇÃO GLOBAL */}
      {alertMessage && (
        <div className="alert-overlay">
          <div className="alert-box">
            <p>{alertMessage.text}</p>

            {alertMessage.type === 'confirm' ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  style={{ backgroundColor: '#dc3545' }}
                  onClick={() => setAlertMessage(null)}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const cb = alertMessage.onConfirm;
                    setAlertMessage(null);
                    cb && cb(); // executa callback de confirmação
                  }}
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button onClick={() => setAlertMessage(null)}>OK</button>
            )}
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};