import { getInitials, groupByDate } from '../components/Chat.js/';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../components/Chat.js/';
import { AppContext } from '../context/AppContext';
import * as api from '../services/api';
import '@testing-library/jest-dom';

describe('getInitials', () => {
  test('retorna duas letras para nome único', () => {
    expect(getInitials('Matheus')).toBe('MA');
  });

  test('retorna iniciais do primeiro e último nome', () => {
    expect(getInitials('Matheus Bicalho')).toBe('MB');
  });

  test('ignora espaços extras e case', () => {
    expect(getInitials('  matheus   bicalho ')).toBe('MB');
  });
});

describe('groupByDate', () => {
  const now = new Date();
  const yesterday = new Date(Date.now() - 86400000);

  const msgs = [
    { id: 1, timestamp: now.toISOString(), content: 'Hoje' },
    { id: 2, timestamp: yesterday.toISOString(), content: 'Ontem' },
    { id: 3, timestamp: '2023-12-25T10:00:00Z', content: 'Natal' },
  ];

  test('agrupa mensagens por "Hoje", "Ontem" e data formatada', () => {
    const grouped = groupByDate(msgs);
    expect(grouped['Hoje']).toHaveLength(1);
    expect(grouped['Ontem']).toHaveLength(1);

    const keys = Object.keys(grouped);
    const hasCustomDate = keys.some(k => !['Hoje', 'Ontem'].includes(k));
    expect(hasCustomDate).toBe(true);
  });
});

// Chat Component

jest.mock('../services/api', () => ({
  sendMessage: jest.fn(),
  uploadFile: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'blob:mocked-url');

// Mock de scrollIntoView para evitar erro no jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockAddMessageLocally = jest.fn();
const mockResetPreview = jest.fn();

const renderChat = (overrides = {}) => {
  const defaultContext = {
    user: 'Matheus',
    messages: [],
    preview: null,
    setPreview: jest.fn(),
    resetPreview: mockResetPreview,
    addMessageLocally: mockAddMessageLocally,
    logout: jest.fn(),
    handleResetChat: jest.fn(),
  };

  return render(
    <AppContext.Provider value={{ ...defaultContext, ...overrides }}>
      <Chat />
    </AppContext.Provider>
  );
};

describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza corretamente com mensagem inicial', () => {
    renderChat();
    expect(screen.getByText(/Bem-vindo, Matheus/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma mensagem ainda/i)).toBeInTheDocument();
  });

  test('envia mensagem de texto com sucesso', async () => {
    api.sendMessage.mockResolvedValueOnce({
      id: 1,
      sender: 'Matheus',
      content: 'Oi!',
      timestamp: new Date().toISOString(),
      type: 'text',
    });

    renderChat();

    const textarea = screen.getByPlaceholderText(/Digite sua mensagem/i);
    fireEvent.change(textarea, { target: { value: 'Oi!' } });

    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(api.sendMessage).toHaveBeenCalled();
    });
  });

  test('não envia mensagem vazia', async () => {
    renderChat();
    const button = screen.getByRole('button', { name: /enviar/i });
    fireEvent.click(button);
    expect(api.sendMessage).not.toHaveBeenCalled();
  });

  test('mostra preview de imagem ao selecionar arquivo', async () => {
    const setPreview = jest.fn();
    renderChat({ setPreview });

    const file = new File(['(⌐□_□)'], 'foto.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Selecionar imagem ou áudio/i);

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(setPreview).toHaveBeenCalled();
    });
  });

  test('toggle emoji picker', () => {
  renderChat();
  const emojiButton = screen.getByRole('button', { name: /Selecionar Emoji/i });
  fireEvent.click(emojiButton);
  const emojis = screen.getAllByText('😀');
  expect(emojis.length).toBeGreaterThan(0);
});
});
