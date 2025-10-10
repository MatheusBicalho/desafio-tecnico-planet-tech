# 💬 [Planetfone Web Chat]

Uma aplicação de chat moderna e responsiva construída com React, seguindo a estética Dark Mode e otimizada para usabilidade, incluindo funcionalidades essenciais como envio de mídia e seleção de emojis.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com foco em componentes reutilizáveis e estilização moderna (CSS-in-JS ou CSS Puro).

* **Frontend:** React (Hooks e Context API)
* **Estilização:** CSS Puro / Flexbox / WebKit Custom Scrollbars
* **Linguagem:** JavaScript (ES6+)
* **Gerenciamento de Estado:** React Context API (simulação de estado global)
* **Comunicação (Simulada):** Simulação de chamadas a serviços de API para envio de mensagens

## ✨ Funcionalidades Principais (Features)

O sistema de chat inclui as seguintes funcionalidades:

1.  **Estética Dark Mode:** Design moderno com foco em alto contraste e paleta escura.
2.  **Entrada de Mensagens Aprimorada:**
    * **Anexo de Mídia:** Ícone de clips para anexar imagens (`.png`, `.jpg`) e áudios (`.mp3`, `.wav`).
    * **Seleção Rápida de Emojis:** Painel flutuante com emojis Unicode para comunicação expressiva.
    * **Usabilidade:** O painel de emojis fecha automaticamente após o envio da mensagem.
3.  **Visualização de Conversa:**
    * **Agrupamento por Data:** Mensagens agrupadas por "Hoje", "Ontem" ou data formatada.
    * **Balões de Mensagem Distintos:** Estilo visual claro para mensagens enviadas (verde) e recebidas (cinza escuro).
4.  **Componentes Estilizados:**
    * **Barra de Rolagem Personalizada:** Estilização WebKit para uma barra de rolagem fina e discreta que se harmoniza com o tema Dark Mode.
    * **Efeito Neon/Brilho:** O slogan e a logo utilizam `text-shadow` e `box-shadow` para dar um efeito de profundidade e destaque.

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/en) (versão LTS) e o npm instalados.

### Passos de Instalação

```bash
# 1. Clone o repositório
git clone 
cd backend

# 2. Instale as dependências do backend
npm install

# 3. Inicie o projeto backend
npm start

# 4. Instale as dependências do frontend
cd ..
cd frontend

npm install

# 5. Inicie o projeto frontend
npm start


O aplicativo será aberto em http://localhost:3000.
