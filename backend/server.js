require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS
app.use(cors());

app.use(express.json());

// Endpoint para ejecutar scripts de actualización de datos
app.post('/api/update-dashboard-data', (req, res) => {
  console.log('Iniciando actualización de datos del dashboard...');
  
  const demographicsScript = path.join(__dirname, 'python', 'track_demographics.py');
  const followerInsightsScript = path.join(__dirname, 'python', 'save_follower_insights.py');
  const instagramDetailsScript = path.join(__dirname, 'python', 'save_instagram_details.py');
  
  let demographicsCompleted = false;
  let followerInsightsCompleted = false;
  let instagramDetailsCompleted = false;
  let errors = [];
  
  function checkCompletion() {
    if (demographicsCompleted && followerInsightsCompleted && instagramDetailsCompleted) {
      if (errors.length > 0) {
        console.error('Errores durante la actualización:', errors);
        res.status(500).json({ 
          success: false, 
          error: 'Error en la actualización de datos', 
          details: errors 
        });
      } else {
        console.log('Actualización de datos completada exitosamente');
        res.json({ success: true, message: 'Datos actualizados correctamente' });
      }
    }
  }
  
  // Ejecutar script de demografía
  execFile('python', [demographicsScript], { cwd: path.dirname(demographicsScript) }, (error, stdout, stderr) => {
    demographicsCompleted = true;
    if (error) {
      console.error('Error ejecutando track_demographics.py:', error, stderr);
      errors.push(`Error en demografía: ${error.message}`);
    } else {
      console.log('track_demographics.py completado exitosamente');
    }
    checkCompletion();
  });
  
  // Ejecutar script de follower insights
  execFile('python', [followerInsightsScript], { cwd: path.dirname(followerInsightsScript) }, (error, stdout, stderr) => {
    followerInsightsCompleted = true;
    if (error) {
      console.error('Error ejecutando save_follower_insights.py:', error, stderr);
      errors.push(`Error en follower insights: ${error.message}`);
    } else {
      console.log('save_follower_insights.py completado exitosamente');
    }
    checkCompletion();
  });
  
  // Ejecutar script de detalles de Instagram
  execFile('python', [instagramDetailsScript], { cwd: path.dirname(instagramDetailsScript) }, (error, stdout, stderr) => {
    instagramDetailsCompleted = true;
    if (error) {
      console.error('Error ejecutando save_instagram_details.py:', error, stderr);
      errors.push(`Error en detalles de Instagram: ${error.message}`);
    } else {
      console.log('save_instagram_details.py completado exitosamente');
    }
    checkCompletion();
  });
});

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

// Endpoint para obtener follower insights
app.get('/api/follower-insights', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'follower_insights.json');
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo de follower insights no encontrado' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer follower insights:', error);
    res.status(500).json({ error: 'Error al leer los datos de follower insights' });
  }
});

// Endpoint para obtener detalles de Instagram
app.get('/api/instagram-details', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'instagram_details.json');
  
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo de detalles de Instagram no encontrado' });
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer detalles de Instagram:', error);
    res.status(500).json({ error: 'Error al leer los detalles de Instagram' });
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

app.post('/api/instagram/fetch-posts', (req, res) => {
  const scriptPath = path.join(__dirname, 'python', 'save_instagram_posts.py');
  execFile('python', [scriptPath], { cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error ejecutando script:', error, stderr);
      return res.status(500).json({ error: 'Error ejecutando script de Instagram' });
    }
    // Después de guardar los posts, guardamos los detalles generales
    const detailsScript = path.join(__dirname, 'python', 'save_instagram_details.py');
    execFile('python', [detailsScript], { cwd: path.dirname(detailsScript) }, (err2, stdout2, stderr2) => {
      if (err2) {
        console.error('Error ejecutando script de detalles:', err2, stderr2);
        // No detenemos la respuesta, solo avisamos en consola
      }
      // Leer el archivo generado y devolverlo
      const postsPath = path.join(__dirname, 'python', 'instagram_posts.json');
      if (fs.existsSync(postsPath)) {
        const data = fs.readFileSync(postsPath, 'utf8');
        return res.json({ success: true, posts: JSON.parse(data) });
      } else {
        return res.status(500).json({ error: 'No se generó el archivo de publicaciones' });
      }
    });
  });
});

// Endpoint para crear una publicación inmediata en Instagram
app.post('/api/instagram/create-post', (req, res) => {
  const { image_url, caption } = req.body;
  if (!image_url || !caption) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_post.py');
  const args = ['--image_url', image_url, '--caption', caption];
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  let output = '';
  py.stdout.on('data', (data) => { output += data.toString(); });
  py.stderr.on('data', (data) => { output += data.toString(); });
  py.on('close', (code) => {
    try {
      const json = JSON.parse(output);
      res.json(json);
    } catch (e) {
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

app.post('/api/instagram/schedule-post', async (req, res) => {
  const { image_url, caption, date, time } = req.body;
  if (!image_url || !caption || !date || !time) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  // Convertir fecha y hora a timestamp
  const fechaHora = `${date} ${time}`;
  const fecha_dt = new Date(`${date}T${time}`);
  const scheduled_time = Math.floor(fecha_dt.getTime() / 1000);
  try {
    // Obtener instagram_id
    const scriptPath = path.join(__dirname, 'python', 'create_instagram_post.py');
    const { spawnSync } = require('child_process');
    // Usar extract_instagram_id desde Python
    const extractIdScript = `from graphAPI import extract_instagram_id; import json; print(json.dumps(extract_instagram_id()))`;
    const idResult = spawnSync('python', ['-c', extractIdScript], { cwd: path.join(__dirname, 'python') });
    const [instagram_id] = JSON.parse(idResult.stdout.toString());
    if (!instagram_id) return res.status(500).json({ error: 'No se encontró una cuenta de Instagram Business asociada' });
    // Crear contenedor
    const makeApiScript = `from graphAPI import make_api_request; import sys, json; params = {'image_url': sys.argv[1], 'caption': sys.argv[2]}; print(json.dumps(make_api_request(f'{sys.argv[3]}/media', params, method='POST')))`;
    const contResult = spawnSync('python', ['-c', makeApiScript, image_url, caption, instagram_id], { cwd: path.join(__dirname, 'python') });
    const container_response = JSON.parse(contResult.stdout.toString());
    if (!container_response || !container_response.id) return res.status(500).json({ error: 'No se pudo crear el contenedor de la publicación' });
    const creation_id = container_response.id;
    // Guardar en scheduled_posts.json
    const scheduledPath = path.join(__dirname, 'python', 'scheduled_posts.json');
    let posts = [];
    if (fs.existsSync(scheduledPath)) {
      posts = JSON.parse(fs.readFileSync(scheduledPath, 'utf8'));
    }
    posts.push({ instagram_id, creation_id, scheduled_time, caption, image_url });
    fs.writeFileSync(scheduledPath, JSON.stringify(posts, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Error programando publicación', details: e.message });
  }
});

app.post('/api/instagram/suggestions', async (req, res) => {
  try {
    const postsPath = path.join(__dirname, 'python', 'instagram_posts.json');
    const scheduledPath = path.join(__dirname, 'python', 'scheduled_posts.json');
    const detailsPath = path.join(__dirname, 'python', 'instagram_details.json');
    const demographicsPath = path.join(__dirname, 'python', 'demographics_history.json');
    const followerInsightsPath = path.join(__dirname, 'python', 'follower_insights.json');
    
    const posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
    const scheduled = fs.existsSync(scheduledPath) ? JSON.parse(fs.readFileSync(scheduledPath, 'utf8')) : [];
    const details = fs.existsSync(detailsPath) ? JSON.parse(fs.readFileSync(detailsPath, 'utf8')) : {};
    const demographics = fs.existsSync(demographicsPath) ? JSON.parse(fs.readFileSync(demographicsPath, 'utf8')) : {};
    const followerInsights = fs.existsSync(followerInsightsPath) ? JSON.parse(fs.readFileSync(followerInsightsPath, 'utf8')) : {};
    
    // Construir prompt mejorado con análisis de patrones y demografía
    const prompt = `Eres un experto en marketing digital para Instagram. Analiza los siguientes datos de la cuenta incluyendo demografía, insights de seguidores, publicaciones y estadísticas. 

DATOS A ANALIZAR:
1. Información general de la cuenta: ${JSON.stringify(details, null, 2)}
2. Historial de demografía: ${JSON.stringify(demographics, null, 2)}
3. Insights de seguidores: ${JSON.stringify(followerInsights, null, 2)}
4. Publicaciones actuales: ${JSON.stringify(posts, null, 2)}
5. Publicaciones programadas: ${JSON.stringify(scheduled, null, 2)}

ANÁLISIS REQUERIDO:
- Identifica patrones de crecimiento de seguidores (días/fechas con mayor crecimiento)
- Analiza la demografía actual (género, edad, ubicación) 
- Detecta correlaciones entre publicaciones y crecimiento de audiencia
- Evalúa la consistencia del contenido y frecuencia de publicación

GENERA ESTRATEGIAS ESPECÍFICAS que incluyan:
1. Horarios óptimos de publicación basados en los datos de crecimiento
2. Tipo de contenido recomendado según la demografía de la audiencia
3. Estrategias para aprovechar los días de mayor crecimiento detectados
4. Recomendaciones para segmentar contenido por demografía
5. Acciones concretas para mejorar engagement y alcance

Responde de forma concisa y estructurada con sugerencias accionables:`;
    
    // Llamar al endpoint de IA ya existente
    const iaRes = await axios.post('http://localhost:3001/api/ia-chat', {
      question: prompt,
      section: 'Instagram Marketing'
    });
    res.json({ suggestions: iaRes.data.answer });
  } catch (e) {
    res.status(500).json({ error: 'Error generando sugerencias', details: e.message });
  }
});

// Middleware para servir archivos estáticos desde la carpeta python
app.use('/python', express.static(path.join(__dirname, 'python')));

// Endpoint para obtener los posts programados de Instagram
app.get('/api/instagram/scheduled-posts', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'scheduled_posts.json');
  try {
    if (!fs.existsSync(filePath)) {
      return res.json([]); // Devuelve array vacío si no existe
    }
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error al leer scheduled_posts.json:', error);
    res.status(500).json({ error: 'Error al leer los posts programados' });
  }
});

// Endpoint para eliminar una publicación programada por creation_id
app.delete('/api/instagram/scheduled-posts/:creation_id', (req, res) => {
  const filePath = path.join(__dirname, 'python', 'scheduled_posts.json');
  const { creation_id } = req.params;
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const newData = data.filter(post => String(post.creation_id) !== String(creation_id));
    fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar publicación programada:', error);
    res.status(500).json({ error: 'Error al eliminar publicación programada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor IA escuchando en http://localhost:${PORT}`);
}); 