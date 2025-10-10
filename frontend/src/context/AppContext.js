// /frontend/src/context/AppContext.js - CÓDIGO FINAL E COMPLETO
import React, { createContext, useState, useEffect } from 'react';
import * as api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [preview, setPreview] = useState(null);

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

  const handleResetChat = async () => {
      // Confirmação para evitar exclusão acidental
      if (window.confirm('Tem certeza que deseja LIMPAR PERMANENTEMENTE o chat? Isso não pode ser desfeito.')) {
          try {
              await api.resetChat(); // Chama o endpoint do backend
              clearMessages(); // Limpa imediatamente o estado local (frontend)
              alert('Chat limpo com sucesso!');
          } catch (error) {
              console.error('Falha ao resetar o chat:', error);
              alert('Erro ao limpar o chat. Verifique o console e o servidor.');
          }
      }
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
    handleResetChat // Exportado para o Chat.js
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};