// /frontend/src/services/api.js - CÓDIGO FINAL E CORRIGIDO

// CRÍTICO: Removido '/api' para que o proxy do React no package.json funcione corretamente
const API_BASE = ''; 

export const getMessages = async () => {
  const response = await fetch(`${API_BASE}/messages`);
  if (!response.ok) throw new Error('Erro ao buscar mensagens');
  return response.json();
};

export const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error('Erro ao enviar mensagem');
  return response.json();
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Erro ao fazer upload');
  return response.json();
};

// NOVO: Função para limpar o chat
export const resetChat = async () => {
  const response = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Erro ao limpar o chat');
  return response.json();
};