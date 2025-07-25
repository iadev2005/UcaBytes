require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

// Nuevo endpoint para tips útiles
app.post('/api/tip-util', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Falta la pregunta' });
  }

  // Siempre fuerza la sección a "Tips Útiles"
  const prompt = `Responde como un tip útil para negocios y que sea de varios temas, ten  en cuenta que no debe pasar las 2 líneas y no hagas mensajes con negritas: ${question}`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta de la IA.";
    res.json({ tip: text });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ tip: "Error al conectar con la IA." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor IA escuchando en http://localhost:${PORT}`);
}); 