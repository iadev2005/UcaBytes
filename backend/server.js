require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS
app.use(cors());

app.use(express.json());

// Endpoint para obtener el histórico de seguidores
app.get('/api/followers', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'followers_history.json');
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({ error: 'Error al leer los datos de seguidores' });
  }
});

// Endpoint para obtener el histórico de demografías
app.get('/api/demographics', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'demographics_history.json');
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo de demografías no encontrado' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer demografías:', error);
    res.status(500).json({ error: 'Error al leer los datos demográficos' });
  }
});

app.post('/api/ia-chat', async (req, res) => {
  const { question, section } = req.body;
  if (!question || !section) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // Construye el prompt contextual
  const prompt = `Responde orientado a la sección "${section}": ${question}`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta de la IA.";
    res.json({ answer: text });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ answer: "Error al conectar con la IA." });
  }
});

// Middleware para servir archivos estáticos desde la carpeta python
app.use('/python', express.static(path.join(__dirname, 'python')));

app.listen(PORT, () => {
  console.log(`Servidor IA escuchando en http://localhost:${PORT}`);
}); 