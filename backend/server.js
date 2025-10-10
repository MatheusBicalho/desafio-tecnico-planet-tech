const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 3001;

// --- CRÍTICO: Criação da pasta 'uploads' antes da inicialização ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Pasta "uploads" criada.');
}
// --------------------------------------------------------------------------

// Middleware
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(uploadsDir));

// Armazenamento em memória (array de mensagens)
let messages = [];

// Inicializar de arquivo JSON se existir
const messagesFile = path.join(__dirname, 'messages.json');
if (fs.existsSync(messagesFile)) {
  try {
    messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
  } catch (error) {
    console.error('Erro ao ler messages.json:', error);
  }
}

// Configurar multer para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Endpoint: POST /upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Endpoint: POST /messages
app.post('/messages', (req, res) => {
  const { content, sender, type } = req.body;
  const id = uuidv4();
  const timestamp = req.body.timestamp || new Date().toISOString();

  if (!content || !sender || !type) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const message = { id, content, sender, type, timestamp };
  messages.push(message);

  // Salvar em JSON para persistência
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  res.status(201).json(message);
});

// Endpoint: POST /reset (NOVO)
app.post('/reset', (req, res) => {
  messages = []; // Zera o array em memória
  try {
    // Zera o arquivo JSON
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
    res.status(200).json({ message: 'Chat limpo com sucesso.' });
  } catch (error) {
    console.error('Erro ao limpar messages.json:', error);
    res.status(500).json({ error: 'Erro interno ao limpar o chat.' });
  }
});


// Endpoint: GET /messages
app.get('/messages', (req, res) => {
  // Ordenar por timestamp
  const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(sortedMessages);
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});