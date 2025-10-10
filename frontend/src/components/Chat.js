import React, { useState, useRef, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../services/api';

// -----------------------------------------------------------------
// FUNÇÕES DE LÓGICA EXPORTADAS (Prontas para Testes Unitários)
// -----------------------------------------------------------------

// Lógica para gerar uma cor determinística a partir de uma string (nome)
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
    
    // Ajuste para garantir cores escuras o suficiente para texto branco
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
    
    // Calcula o brilho (luminância)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    if (luminance > 0.5) {
        return `hsl(${hash % 360}, 60%, 30%)`; // Cor escura
    }
    return color; // Cor original
};

// Lógica para obter as iniciais
export const getInitials = (sender) => {
  const parts = sender.toUpperCase().trim().split(/\s+/);
    
    if (parts.length === 1) {
        return parts[0].substring(0, 2); 
    }
    return parts[0][0] + parts[parts.length - 1][0];
};

// Agrupa mensagens por data (Hoje, Ontem, ou data formatada)
export const groupByDate = (msgs) => {
  const grouped = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  msgs.forEach((msg) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    let label;
        if (msgDate === today) {
            label = 'Hoje';
        } else if (msgDate === yesterday) {
            label = 'Ontem';
        } else {
            label = new Date(msg.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        }
        if (!grouped[label]) {
            grouped[label] = [];
        }
    grouped[label].push(msg);
  });
  return grouped;
};
// -----------------------------------------------------------------

const Chat = () => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [file, setFile] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null); // ✅ novo estado

  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);
  const inputRef = useRef(null);
  
  const toggleEmojiPicker = () => {
        if (!isSending) {
            setShowEmojiPicker(prev => !prev);
        }
  };

  const handleEmojiClick = (emoji) => {
        setContent(prevContent => prevContent + emoji);
        setShowEmojiPicker(true); // Fecha após selecionar
    inputRef.current?.focus();
  };
    // NOVO: Ref para o input de arquivo
    const fileInputRef = useRef(null);

    const { user, messages, preview, setPreview, logout, resetPreview, addMessageLocally, handleResetChat } = useContext(AppContext);

    const maxChars = 200;

    // Foco automático na montagem do componente (após login)
  useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
  }, [user]);

    // Atualiza contador de caracteres
  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

    // Scroll automático para a última mensagem (SÓ SE O USUÁRIO ESTAVA PERTO DO FIM - POLIMENTO)
  useEffect(() => {
    const messagesList = messagesListRef.current;
    if (messagesList) {
      const { scrollTop, scrollHeight, clientHeight } = messagesList;
            
            if (scrollTop + clientHeight >= scrollHeight - 100) { 
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
        }
  }, [messages]);

    // Formata timestamp para exibição (só hora:minuto)
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',  // Força fuso de São Paulo (UTC-3)
      hour: '2-digit',
      minute: '2-digit'
    });
}

    // Renderiza o conteúdo da mensagem (texto, imagem ou áudio)
  const renderContent = (msg) => {
    switch (msg.type) {
            case 'text':
                return <span className="message-text">{msg.content}</span>;
            case 'image':
                return <img src={msg.content} alt="Imagem enviada" style={{ maxWidth: '100%', height: 'auto' }} />;
            case 'audio':
                return <audio controls src={msg.content} style={{ width: '100%' }} />;
            default:
                return <span>Tipo de mensagem não suportado</span>;
    }
  };

    // FUNÇÃO NOVO: Clica no input de arquivo escondido
  const handleAttachmentClick = () => {
        if (!isSending) {
            fileInputRef.current.click();
        }
  };

    // Manipula seleção de arquivo com preview e validação
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
        // CRÍTICO: Limpa o valor do input file para permitir o reenvio do mesmo arquivo
    e.target.value = null;

    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'audio/wav'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setAlertMessage('Apenas imagens (jpg/png) ou áudio (mp3/wav) são permitidos.');
        return;
      }

      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setType(selectedFile.type.startsWith('image/') ? 'image' : 'audio');
      setFile(selectedFile);
    }
  };

    // Cancela preview de arquivo
  const handleCancelPreview = () => {
        if (preview) {
            URL.revokeObjectURL(preview); // Libera memória
        }
    setPreview(null);
    setFile(null);
    setType('text');
    setContent('');
        
        // NOVO: Limpa o input file referenciado
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // CORREÇÃO: Adiciona setTimeout para foco após re-renderização
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
  };

    // Envia mensagem (texto ou arquivo)
  const handleSend = async () => {
    if ((!content.trim() && !file) || charCount > maxChars) {
      setAlertMessage('Mensagem inválida ou excede o limite de caracteres.');
      inputRef.current?.focus();
      return;
    }

        setIsSending(true); // LIGA O SPINNER

    try {
      let messageContent = content.trim();
      let messageType = type;

      if (file) {
        const uploadResult = await api.uploadFile(file);
        messageContent = uploadResult.url;
        URL.revokeObjectURL(preview);
        setFile(null);
      }
            
      const messageToSend = {
        content: messageContent,
        sender: user,
        type: messageType,
        timestamp: new Date().toISOString(),
      };

      const sentMessage = await api.sendMessage(messageToSend);
            
            // 1. Adiciona a mensagem localmente (Garante visibilidade imediata)
      addMessageLocally(sentMessage);
            
            // 2. Reseta estados
      setContent('');
      setType('text');
      resetPreview();

            // CRÍTICO: FOCA DE VOLTA PARA O INPUT (COM setTimeout PARA EVITAR PERDA DE FOCO NA RE-RENDERIZAÇÃO)
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);

            // CRÍTICO: FORÇA O SCROLL AQUI APÓS O UPDATE LOCAL
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setAlertMessage('Erro ao enviar mensagem. Tente novamente.');
      inputRef.current?.focus(); // Tenta focar mesmo em caso de erro
    } finally {
            setIsSending(false); // DESLIGA O SPINNER
      setShowEmojiPicker(false);
    }
  };

    // Envio com Enter
  const handleKeyPress = (e) => {
    if (!isSending && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

    // Agrupa as mensagens
  const groupedMessages = groupByDate(messages);

    // JSX principal do componente
  return (
    <div className="chat-container">
            {/* Header do chat */}
      <header className="chat-header">
        <h2>Bem-vindo, {user}!</h2>
                
                {/* Agrupamento dos botões para alinhamento */}
        <div className="header-buttons">
                    {/* Botão Limpar Chat - ATUALIZADO */}
                    <button 
                        onClick={handleResetChat} 
                        aria-label="Limpar histórico de mensagens" 
                        className="reset-btn icon-button"
                        disabled={isSending}
                        title="Limpar Chat"
                    >
                        {/* Ícone de Lixeira (SVG simples) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
          </button>
                    
                    {/* Botão Sair */}
                    <button onClick={logout} aria-label="Sair do chat" disabled={isSending}>
                        Sair
                    </button>
        </div>
      </header>

            {/* Lista de mensagens */}
      <div ref={messagesListRef} className="messages-list">
        {Object.entries(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-group">{date}</div>
              {msgs.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`avatar-wrapper ${msg.sender === user ? 'sent-wrapper' : 'received-wrapper'}`}
                                >
                                    {/* Avatar é exibido APENAS para mensagens recebidas */}
                  {msg.sender !== user && (
                                        <div 
                                            className="avatar"
                                            style={{ backgroundColor: stringToColor(msg.sender) }}
                                        >
                      {getInitials(msg.sender)}
                    </div>
                  )}

                                    <div
                                        className={`message ${msg.sender === user ? 'sent' : 'received'}`}
                                    >
                    <div className="message-header">
                      <strong>{msg.sender}</strong> - {formatTimestamp(msg.timestamp)}
                    </div>
                                        <div className="message-content">
                                            {renderContent(msg)}
                                        </div>
                  </div>
                                    
                                    {/* Avatar é exibido para mensagens enviadas, alinhado à direita */}
                  {msg.sender === user && (
                                        <div 
                                            className="avatar sent-avatar"
                                            style={{ backgroundColor: stringToColor(msg.sender) }}
                                        >
                      {getInitials(msg.sender)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            Nenhuma mensagem ainda. Envie a primeira!
          </p>
        )}
                <div ref={messagesEndRef} /> {/* Âncora para scroll */}
      </div>

            {/* Formulário de envio */}
      <form className="send-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                
                {/* NOVO: Painel de Emojis que aparece acima do input */}
        {showEmojiPicker && (
          <div className="emoji-picker-popup">
                        {/* 5 Emojis simples e populares */}
                        <span onClick={() => handleEmojiClick('😀')} className="emoji-item" role="img" aria-label="sorriso">😀</span>
                        <span onClick={() => handleEmojiClick('👍')} className="emoji-item" role="img" aria-label="positivo">👍</span>
                        <span onClick={() => handleEmojiClick('❤️')} className="emoji-item" role="img" aria-label="coração">❤️</span>
                        <span onClick={() => handleEmojiClick('🎉')} className="emoji-item" role="img" aria-label="festa">🎉</span>
                        <span onClick={() => handleEmojiClick('🤔')} className="emoji-item" role="img" aria-label="pensando">🤔</span>
          </div>
        )}

        <div className="input-area">
                    
                    {/* NOVO: message-input-wrapper (para agrupar anexo + emoji + textarea) */}
          <div className="message-input-wrapper">
                        
                        {/* Botão de Anexo (aciona o input file escondido) */}
                        <button
                            type="button"
                            className="attachment-icon-button"
                            onClick={handleAttachmentClick}
                            disabled={isSending}
                            aria-label="Anexar arquivo (imagem ou áudio)"
                        >
                            {/* ÍCONE PNG */}
                            <img 
                                src="/images/upload.png" 
                                alt="Anexar arquivo" 
                                className="attachment-png-icon" 
                            />
            </button>

                
                        <button
                        type="button"className={`emoji-button ${showEmojiPicker ? 'active' : ''}`}
                        onClick={toggleEmojiPicker}
                        disabled={isSending}
                        aria-label="Selecionar Emoji"
                        title="Emojis">

                        😀
                        </button>
                        
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              className="text-input"
              placeholder="Digite sua mensagem..."
              maxLength={maxChars}
                            aria-label="Campo para digitar mensagem de texto"
              disabled={!!file || isSending}
              rows={1}
            />
                        
                        {/* Input de arquivo (ESCONDIDO) */}
                        <input
                            ref={fileInputRef} 
                            type="file"
                            accept="image/jpeg,image/png,audio/mpeg,audio/wav"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            disabled={isSending}
                            aria-label="Selecionar imagem ou áudio para enviar"
                        />
          </div>
                    
                    {/* Botão de enviar lateralizado */}
                    <button
                        type="submit"
                        className="send-button-lateral"
                        disabled={(!content.trim() && !file) || isSending} 
                        aria-label="Enviar mensagem ou arquivo"
                    >
                        {isSending ? (
                            <div className="spinner"></div> 
                        ) : (
                            'Enviar' 
                        
                        )}
          </button>
        </div>
                
                        {/* Elementos que quebram a linha (contador e preview) */}
                <div className="form-bottom-row" style={{ display: preview ? 'flex' : 'none' }}>
                    {/* Contador de caracteres (Se não houver preview, ele estaria na linha do input) */}
                    <div className="char-counter">
                        {charCount}/{maxChars} 
                    </div>

                                       {/* Preview de arquivo (se selecionado) */}
                    {preview && (
                        <div className="preview">
                            {type === 'image' ? (
                                <img src={preview} alt="Preview da imagem" />
                            ) : (
                                <audio controls src={preview} />
                            )}
                            <br />
                            <button
                                type="button"
                                onClick={handleCancelPreview}
                                className="send-btn"
                                style={{ backgroundColor: '#dc3545', marginTop: '5px' }}
                                aria-label="Cancelar envio do arquivo"
                                disabled={isSending}
                            >
                                Cancelar Arquivo
                            </button>
        </div>
      )}
                </div>
                
      {/* ✅ ALERTA PERSONALIZADO */}
      {alertMessage && (
        <div className="alert-overlay">
          <div className="alert-box">
            <p>{alertMessage}</p>
            <button onClick={() => setAlertMessage(null)}>OK</button>
          </div>        
                   
        </div> )}
      </form>
      
        </div>
        
  );
};

export default Chat;