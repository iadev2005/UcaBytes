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
  console.log('[DEBUG] === Endpoint update-dashboard-data llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { token } = req.body;
  
  if (!token) {
    console.log('[ERROR] Token requerido para actualizar datos del dashboard');
    return res.status(400).json({ 
      success: false, 
      error: 'Token de Instagram requerido para actualizar los datos del dashboard' 
    });
  }
  
  console.log('[DEBUG] Iniciando actualización de datos del dashboard con token...');
  
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
        console.error('[ERROR] Errores durante la actualización:', errors);
        res.status(500).json({ 
          success: false, 
          error: 'Error en la actualización de datos', 
          details: errors 
        });
      } else {
        console.log('[DEBUG] Actualización de datos completada exitosamente');
        res.json({ success: true, message: 'Datos actualizados correctamente' });
      }
    }
  }
  
  // Ejecutar script de demografía
  console.log('[DEBUG] Ejecutando track_demographics.py...');
  execFile('python', [demographicsScript, token], { cwd: path.dirname(demographicsScript) }, (error, stdout, stderr) => {
    demographicsCompleted = true;
    if (error) {
      console.error('[ERROR] Error ejecutando track_demographics.py:', error, stderr);
      errors.push(`Error en demografía: ${error.message}`);
    } else {
      console.log('[DEBUG] track_demographics.py completado exitosamente');
    }
    checkCompletion();
  });
  
  // Ejecutar script de follower insights
  console.log('[DEBUG] Ejecutando save_follower_insights.py...');
  execFile('python', [followerInsightsScript, token], { cwd: path.dirname(followerInsightsScript) }, (error, stdout, stderr) => {
    followerInsightsCompleted = true;
    if (error) {
      console.error('[ERROR] Error ejecutando save_follower_insights.py:', error, stderr);
      errors.push(`Error en follower insights: ${error.message}`);
    } else {
      console.log('[DEBUG] save_follower_insights.py completado exitosamente');
    }
    checkCompletion();
  });
  
  // Ejecutar script de detalles de Instagram
  console.log('[DEBUG] Ejecutando save_instagram_details.py...');
  execFile('python', [instagramDetailsScript, token], { cwd: path.dirname(instagramDetailsScript) }, (error, stdout, stderr) => {
    instagramDetailsCompleted = true;
    if (error) {
      console.error('[ERROR] Error ejecutando save_instagram_details.py:', error, stderr);
      errors.push(`Error en detalles de Instagram: ${error.message}`);
    } else {
      console.log('[DEBUG] save_instagram_details.py completado exitosamente');
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

app.post('/api/instagram/validate-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ valid: false, error: 'Token requerido' });
  }

  // Usar graphAPI.py para validar el token
  const scriptPath = path.join(__dirname, 'python', 'validate_token.py');
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, token], { cwd: path.dirname(scriptPath) });
  
  let output = '';
  py.stdout.on('data', (data) => { output += data.toString(); });
  py.stderr.on('data', (data) => { output += data.toString(); });
  
  py.on('close', (code) => {
    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      console.error('Error parsing validation result:', output);
      res.status(500).json({ valid: false, error: 'Error validando token' });
    }
  });
});

// Endpoint para ejecutar el auto_scheduler con el token actual
app.post('/api/instagram/run-auto-scheduler', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  console.log('Ejecutando auto_scheduler con token actual...');
  
  const scriptPath = path.join(__dirname, 'python', 'auto_scheduler.py');
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, token], { cwd: path.dirname(scriptPath) });
  
  let output = '';
  let errorOutput = '';
  
  py.stdout.on('data', (data) => { 
    output += data.toString(); 
    console.log('Auto scheduler stdout:', data.toString());
  });
  py.stderr.on('data', (data) => { 
    errorOutput += data.toString(); 
    console.log('Auto scheduler stderr:', data.toString());
  });
  
  py.on('close', (code) => {
    console.log('Auto scheduler terminó con código:', code);
    
    if (code === 0) {
      res.json({ success: true, message: 'Auto scheduler ejecutado exitosamente' });
    } else {
      res.status(500).json({ error: 'Error ejecutando auto scheduler', details: errorOutput });
    }
  });
});

app.post('/api/instagram/fetch-posts', (req, res) => {
  const { token } = req.body;
  
  console.log('fetch-posts endpoint llamado con token:', token ? 'TOKEN_PROVIDED' : 'NO_TOKEN');
  
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  const scriptPath = path.join(__dirname, 'python', 'save_instagram_posts.py');
  console.log('Ejecutando script:', scriptPath);
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, token], { cwd: path.dirname(scriptPath) });
  
  let output = '';
  let errorOutput = '';
  
  py.stdout.on('data', (data) => { 
    output += data.toString(); 
    console.log('Script stdout:', data.toString());
  });
  py.stderr.on('data', (data) => { 
    errorOutput += data.toString(); 
    console.log('Script stderr:', data.toString());
  });
  
  py.on('close', (code) => {
    console.log('Script terminó con código:', code);
    console.log('Output completo:', output);
    console.log('Error output:', errorOutput);
    
    if (code !== 0) {
      console.error('Error ejecutando script:', output);
      return res.status(500).json({ error: 'Error ejecutando script de Instagram' });
    }
    
    // Después de guardar los posts, guardamos los detalles generales
    const detailsScript = path.join(__dirname, 'python', 'save_instagram_details.py');
    const detailsPy = spawn('python', [detailsScript, token], { cwd: path.dirname(detailsScript) });
    
    let detailsOutput = '';
    detailsPy.stdout.on('data', (data) => { detailsOutput += data.toString(); });
    detailsPy.stderr.on('data', (data) => { detailsOutput += data.toString(); });
    
    detailsPy.on('close', (detailsCode) => {
      if (detailsCode !== 0) {
        console.error('Error ejecutando script de detalles:', detailsOutput);
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
  console.log('[DEBUG] === Endpoint create-post llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { image_url, caption, token } = req.body;
  if (!image_url || !caption || !token) {
    console.log('[ERROR] Faltan parámetros:', { image_url: !!image_url, caption: !!caption, token: !!token });
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  
  console.log('[DEBUG] Parámetros válidos, ejecutando script...');
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_post.py');
  const args = ['--image_url', image_url, '--caption', caption, token];
  console.log('[DEBUG] Script path:', scriptPath);
  console.log('[DEBUG] Argumentos:', args);
  
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  
  let output = '';
  let errorOutput = '';
  
  py.stdout.on('data', (data) => { 
    const dataStr = data.toString();
    output += dataStr;
    console.log('[DEBUG] Script stdout:', dataStr);
  });
  
  py.stderr.on('data', (data) => { 
    const dataStr = data.toString();
    errorOutput += dataStr;
    console.log('[DEBUG] Script stderr:', dataStr);
  });
  
  py.on('close', (code) => {
    console.log('[DEBUG] Script terminó con código:', code);
    console.log('[DEBUG] Output completo:', output);
    console.log('[DEBUG] Error output:', errorOutput);
    
    try {
      // Buscar el último JSON válido en la salida
      const lines = output.split('\n');
      let lastJson = null;
      
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            lastJson = JSON.parse(line);
            console.log('[DEBUG] JSON encontrado en línea:', i, lastJson);
            break;
          } catch (e) {
            // Continuar buscando
          }
        }
      }
      
      if (lastJson) {
        console.log('[DEBUG] JSON parseado exitosamente:', lastJson);
        res.json(lastJson);
      } else {
        // Fallback: intentar parsear toda la salida
        const json = JSON.parse(output);
        console.log('[DEBUG] JSON parseado del output completo:', json);
        res.json(json);
      }
    } catch (e) {
      console.log('[ERROR] Error parseando JSON:', e);
      console.log('[ERROR] Output que causó el error:', output);
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

// Endpoint para crear una publicación de video inmediata en Instagram
app.post('/api/instagram/create-video', (req, res) => {
  const { video_url, caption, token } = req.body;
  if (!video_url || !caption || !token) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_video.py');
  const args = ['--video_url', video_url, '--caption', caption, token];
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  let output = '';
  let lastJsonOutput = null;
  
  py.stdout.on('data', (data) => { 
    output += data.toString(); 
    // Buscar el último JSON válido en la salida
    const lines = output.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          lastJsonOutput = JSON.parse(line);
          break;
        } catch (e) {
          // Continuar buscando
        }
      }
    }
  });
  
  py.stderr.on('data', (data) => { 
    output += data.toString(); 
  });
  
  py.on('close', (code) => {
    try {
      // Usar el último JSON válido encontrado
      if (lastJsonOutput) {
        if (lastJsonOutput.success) {
          res.json({ 
            success: true, 
            message: 'Publicación realizada con éxito',
            post_id: lastJsonOutput.response.id,
            caption: caption
          });
        } else {
          res.status(500).json({ 
            error: 'Error creando publicación', 
            details: lastJsonOutput.error 
          });
        }
      } else {
        // Fallback: intentar parsear toda la salida
        const json = JSON.parse(output);
        res.json(json);
      }
    } catch (e) {
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

// Endpoint para crear una historia de Instagram
app.post('/api/instagram/create-story', (req, res) => {
  console.log('[DEBUG] Endpoint create-story llamado con:', req.body);
  const { media_url, token } = req.body;
  if (!media_url || !token) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_story.py');
  const args = ['--media_url', media_url, token];
  console.log('[DEBUG] Ejecutando script con args:', args);
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  let output = '';
  let lastJsonOutput = null;
  
  py.stdout.on('data', (data) => { 
    const dataStr = data.toString();
    output += dataStr; 
    console.log('[DEBUG] Script output:', dataStr);
    
    // Buscar JSON entre marcadores específicos
    const jsonStartIndex = output.indexOf('JSON_RESPONSE_START');
    const jsonEndIndex = output.indexOf('JSON_RESPONSE_END');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      const jsonContent = output.substring(jsonStartIndex + 'JSON_RESPONSE_START'.length, jsonEndIndex).trim();
      try {
        lastJsonOutput = JSON.parse(jsonContent);
        console.log('[DEBUG] JSON encontrado entre marcadores:', lastJsonOutput);
      } catch (e) {
        console.log('[DEBUG] Error parseando JSON entre marcadores:', e.message);
      }
    } else {
      // Fallback: buscar el último JSON válido en la salida
      const lines = output.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            lastJsonOutput = JSON.parse(line);
            console.log('[DEBUG] JSON encontrado en fallback:', lastJsonOutput);
            break;
          } catch (e) {
            // Continuar buscando
          }
        }
      }
    }
  });
  
  py.stderr.on('data', (data) => { 
    const errorStr = data.toString();
    output += errorStr; 
    console.log('[DEBUG] Script error:', errorStr);
  });
  
  py.on('close', (code) => {
    console.log('[DEBUG] Script terminado con código:', code);
    console.log('[DEBUG] Output completo:', output);
    console.log('[DEBUG] lastJsonOutput:', lastJsonOutput);
    
    try {
      // Usar el último JSON válido encontrado
      if (lastJsonOutput) {
        console.log('[DEBUG] Usando lastJsonOutput para respuesta');
        if (lastJsonOutput.success) {
          const response = { 
            success: true, 
            message: 'Historia publicada con éxito',
            story_id: lastJsonOutput.response.id,
            media_type: lastJsonOutput.media_type,
            media_url: media_url
          };
          console.log('[DEBUG] Enviando respuesta exitosa:', response);
          res.json(response);
        } else {
          console.log('[DEBUG] Enviando respuesta de error');
          res.status(500).json({ 
            error: 'Error creando historia', 
            details: lastJsonOutput.error 
          });
        }
      } else {
        console.log('[DEBUG] No se encontró JSON válido, intentando parsear toda la salida');
        // Fallback: intentar parsear toda la salida
        const json = JSON.parse(output);
        res.json(json);
      }
    } catch (e) {
      console.log('[DEBUG] Error parseando respuesta:', e.message);
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

// Endpoint para crear carrusel mixto (fotos y videos)
app.post('/api/instagram/create-mixed-carousel', (req, res) => {
  console.log('[DEBUG] === Endpoint create-mixed-carousel llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { media_urls, caption, token } = req.body;
  
  if (!media_urls || !Array.isArray(media_urls) || media_urls.length < 2) {
    console.log('[ERROR] Faltan URLs de medios válidas');
    return res.status(400).json({ error: 'Se requieren al menos 2 URLs de medios para crear un carrusel' });
  }
  
  if (media_urls.length > 10) {
    console.log('[ERROR] Demasiados medios');
    return res.status(400).json({ error: 'Máximo 10 medios permitidos' });
  }
  
  if (!caption || caption.trim() === '') {
    console.log('[ERROR] Falta caption');
    return res.status(400).json({ error: 'El caption es requerido' });
  }
  
  if (!token) {
    console.log('[ERROR] Falta token');
    return res.status(400).json({ error: 'Token requerido' });
  }
  
  console.log('[DEBUG] Parámetros válidos, ejecutando script...');
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_mixed_carousel.py');
  const args = ['--media_urls', ...media_urls, '--caption', caption, token];
  console.log('[DEBUG] Script path:', scriptPath);
  console.log('[DEBUG] Argumentos:', args);
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  
  let output = '';
  let errorOutput = '';
  let lastJsonOutput = null;
  
  py.stdout.on('data', (data) => { 
    const dataStr = data.toString();
    output += dataStr;
    console.log('[DEBUG] Script stdout:', dataStr);
    
    // Buscar el último JSON válido en la salida
    const lines = output.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          lastJsonOutput = JSON.parse(line);
          break;
        } catch (e) {
          // Continuar buscando
        }
      }
    }
  });
  
  py.stderr.on('data', (data) => { 
    const dataStr = data.toString();
    errorOutput += dataStr;
    console.log('[DEBUG] Script stderr:', dataStr);
  });
  
  py.on('close', (code) => {
    console.log('[DEBUG] Script terminó con código:', code);
    console.log('[DEBUG] Output completo:', output);
    console.log('[DEBUG] Error output:', errorOutput);
    console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
    try {
      // Usar el último JSON válido encontrado
      if (lastJsonOutput) {
        console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
        res.json(lastJsonOutput);
      } else {
        // Fallback: intentar parsear toda la salida
        const json = JSON.parse(output);
        console.log('[DEBUG] JSON parseado del output completo:', json);
        res.json(json);
      }
    } catch (e) {
      console.log('[ERROR] Error parseando JSON:', e);
      console.log('[ERROR] Output que causó el error:', output);
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

app.post('/api/instagram/schedule-post', async (req, res) => {
  console.log('[DEBUG] === Endpoint schedule-post llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { image_url, caption, date, time, token } = req.body;
  if (!image_url || !caption || !date || !time || !token) {
    console.log('[ERROR] Faltan parámetros:', { image_url: !!image_url, caption: !!caption, date: !!date, time: !!time, token: !!token });
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  
  // Convertir fecha y hora a timestamp
  const fecha_dt = new Date(`${date}T${time}`);
  const scheduled_time = Math.floor(fecha_dt.getTime() / 1000);
  
  console.log('[DEBUG] Fecha programada:', fecha_dt);
  console.log('[DEBUG] Timestamp:', scheduled_time);
  
  try {
    console.log('[DEBUG] Ejecutando script de programación...');
    const scriptPath = path.join(__dirname, 'python', 'create_instagram_post_scheduled.py');
    const args = ['--image_url', image_url, '--caption', caption, '--scheduled_time', scheduled_time.toString(), token];
    
    console.log('[DEBUG] Script path:', scriptPath);
    console.log('[DEBUG] Argumentos:', args);
    
    const { spawn } = require('child_process');
    const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
    
    let output = '';
    let errorOutput = '';
    let lastJsonOutput = null;
    
    py.stdout.on('data', (data) => { 
      const dataStr = data.toString();
      output += dataStr;
      console.log('[DEBUG] Script stdout:', dataStr);
      
      // Buscar el último JSON válido en la salida
      const lines = output.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            lastJsonOutput = JSON.parse(line);
            break;
          } catch (e) {
            // Continuar buscando
          }
        }
      }
    });
    
    py.stderr.on('data', (data) => { 
      const dataStr = data.toString();
      errorOutput += dataStr;
      console.log('[DEBUG] Script stderr:', dataStr);
    });
    
    py.on('close', (code) => {
      console.log('[DEBUG] Script terminó con código:', code);
      console.log('[DEBUG] Output completo:', output);
      console.log('[DEBUG] Error output:', errorOutput);
      console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
      
      try {
        if (lastJsonOutput && lastJsonOutput.success) {
          console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
          
          // Ejecutar auto_scheduler automáticamente después de programar exitosamente
          console.log('[DEBUG] Ejecutando auto_scheduler automáticamente...');
          const autoSchedulerPath = path.join(__dirname, 'python', 'auto_scheduler.py');
          const autoSchedulerPy = spawn('python', [autoSchedulerPath, token], { cwd: path.dirname(autoSchedulerPath) });
          
          autoSchedulerPy.on('close', (autoSchedulerCode) => {
            console.log('[DEBUG] Auto scheduler terminó con código:', autoSchedulerCode);
            res.json(lastJsonOutput);
          });
          
          autoSchedulerPy.on('error', (autoSchedulerError) => {
            console.log('[DEBUG] Error ejecutando auto scheduler:', autoSchedulerError);
            res.json(lastJsonOutput);
          });
        } else {
          // Fallback: intentar parsear toda la salida
          const json = JSON.parse(output);
          console.log('[DEBUG] JSON parseado del output completo:', json);
          res.json(json);
        }
      } catch (e) {
        console.log('[ERROR] Error parseando JSON:', e);
        console.log('[ERROR] Output que causó el error:', output);
        res.status(500).json({ error: 'Error ejecutando script', details: output });
      }
    });
  } catch (e) {
    console.log('[ERROR] Error inesperado:', e);
    res.status(500).json({ error: 'Error programando publicación', details: e.message });
  }
});

app.post('/api/instagram/schedule-carousel', async (req, res) => {
  console.log('[DEBUG] === Endpoint schedule-carousel llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { media_urls, image_urls, caption, date, time, token } = req.body;
  if (!caption || !date || !time || !token) {
    console.log('[ERROR] Faltan parámetros:', { caption: !!caption, date: !!date, time: !!time, token: !!token });
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }
  
  // Determinar qué URLs usar (media_urls para mixto, image_urls para solo imágenes)
  const urls = media_urls || image_urls;
  if (!urls || !Array.isArray(urls) || urls.length < 2) {
    console.log('[ERROR] URLs inválidas:', urls);
    return res.status(400).json({ error: 'Se requieren al menos 2 URLs para crear un carrusel' });
  }
  
  if (urls.length > 10) {
    console.log('[ERROR] Demasiados medios:', urls.length);
    return res.status(400).json({ error: 'Máximo 10 medios permitidos' });
  }
  
  // Convertir fecha y hora a timestamp
  const fecha_dt = new Date(`${date}T${time}`);
  const scheduled_time = Math.floor(fecha_dt.getTime() / 1000);
  
  console.log('[DEBUG] Fecha programada:', fecha_dt);
  console.log('[DEBUG] Timestamp:', scheduled_time);
  console.log('[DEBUG] URLs:', urls);
  
  try {
    
    // Determinar si es carrusel mixto o solo imágenes
    const hasVideos = urls.some(url => 
      url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) || 
      url.includes('video') || 
      url.includes('reel')
    );
    
    let creation_id;
    
    if (hasVideos) {
      // Carrusel mixto - usar el script específico para carruseles mixtos programados
      console.log('[DEBUG] Ejecutando script de carrusel mixto programado...');
      const scriptPath = path.join(__dirname, 'python', 'create_instagram_mixed_carousel_scheduled.py');
      const args = ['--media_urls', ...urls, '--caption', caption, '--scheduled_time', scheduled_time.toString(), token];
      
      console.log('[DEBUG] Script path:', scriptPath);
      console.log('[DEBUG] Argumentos:', args);
      
      const { spawn } = require('child_process');
      const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
      
      return new Promise((resolve, reject) => {
        let output = '';
        let lastJsonOutput = null;
        
        py.stdout.on('data', (data) => { 
          output += data.toString(); 
          // Buscar el último JSON válido en la salida
          const lines = output.split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                lastJsonOutput = JSON.parse(line);
                break;
              } catch (e) {
                // Continuar buscando
              }
            }
          }
        });
        
        py.stderr.on('data', (data) => { 
          output += data.toString(); 
        });
        
        py.on('close', (code) => {
          console.log('[DEBUG] Script terminó con código:', code);
          console.log('[DEBUG] Output completo:', output);
          console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
          
          try {
            if (lastJsonOutput && lastJsonOutput.success) {
              console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
              res.json(lastJsonOutput);
            } else {
              // Fallback: intentar parsear toda la salida
              const json = JSON.parse(output);
              console.log('[DEBUG] JSON parseado del output completo:', json);
              res.json(json);
            }
          } catch (e) {
            console.log('[ERROR] Error parseando JSON:', e);
            console.log('[ERROR] Output que causó el error:', output);
            res.status(500).json({ error: 'Error ejecutando script', details: output });
          }
        });
      });
    } else {
      // Carrusel solo imágenes - usar el script específico para carruseles programados
      console.log('[DEBUG] Ejecutando script de carrusel de imágenes programado...');
      const scriptPath = path.join(__dirname, 'python', 'create_instagram_carousel_scheduled.py');
      const args = ['--image_urls', ...urls, '--caption', caption, '--scheduled_time', scheduled_time.toString(), token];
      
      console.log('[DEBUG] Script path:', scriptPath);
      console.log('[DEBUG] Argumentos:', args);
      
      const { spawn } = require('child_process');
      const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
      
      return new Promise((resolve, reject) => {
        let output = '';
        let lastJsonOutput = null;
        
        py.stdout.on('data', (data) => { 
          output += data.toString(); 
          // Buscar el último JSON válido en la salida
          const lines = output.split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.startsWith('{') && line.endsWith('}')) {
              try {
                lastJsonOutput = JSON.parse(line);
                break;
              } catch (e) {
                // Continuar buscando
              }
            }
          }
        });
        
        py.stderr.on('data', (data) => { 
          output += data.toString(); 
        });
        
        py.on('close', (code) => {
          console.log('[DEBUG] Script terminó con código:', code);
          console.log('[DEBUG] Output completo:', output);
          console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
          
          try {
            if (lastJsonOutput && lastJsonOutput.success) {
              console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
              res.json(lastJsonOutput);
            } else {
              // Fallback: intentar parsear toda la salida
              const json = JSON.parse(output);
              console.log('[DEBUG] JSON parseado del output completo:', json);
              res.json(json);
            }
          } catch (e) {
            console.log('[ERROR] Error parseando JSON:', e);
            console.log('[ERROR] Output que causó el error:', output);
            res.status(500).json({ error: 'Error ejecutando script', details: output });
          }
        });
      });
    }
  } catch (e) {
    res.status(500).json({ error: 'Error programando carrusel', details: e.message });
  }
});

app.post('/api/instagram/schedule-video', async (req, res) => {
  console.log('[DEBUG] === Endpoint schedule-video llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { video_url, caption, date, time, token } = req.body;
  if (!video_url || !caption || !date || !time || !token) {
    console.log('[ERROR] Faltan parámetros:', { video_url: !!video_url, caption: !!caption, date: !!date, time: !!time, token: !!token });
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }
  
  // Convertir fecha y hora a timestamp
  const fecha_dt = new Date(`${date}T${time}`);
  const scheduled_time = Math.floor(fecha_dt.getTime() / 1000);
  
  console.log('[DEBUG] Fecha programada:', fecha_dt);
  console.log('[DEBUG] Timestamp:', scheduled_time);
  
  try {
    console.log('[DEBUG] Ejecutando script de programación de video...');
    const scriptPath = path.join(__dirname, 'python', 'create_instagram_video_scheduled.py');
    const args = ['--video_url', video_url, '--caption', caption, '--scheduled_time', scheduled_time.toString(), token];
    
    console.log('[DEBUG] Script path:', scriptPath);
    console.log('[DEBUG] Argumentos:', args);
    const { spawn } = require('child_process');
    const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
    
    let output = '';
    let errorOutput = '';
    let lastJsonOutput = null;
    
    py.stdout.on('data', (data) => { 
      const dataStr = data.toString();
      output += dataStr;
      console.log('[DEBUG] Script stdout:', dataStr);
      
      // Buscar el último JSON válido en la salida
      const lines = output.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            lastJsonOutput = JSON.parse(line);
            break;
          } catch (e) {
            // Continuar buscando
          }
        }
      }
    });
    
    py.stderr.on('data', (data) => { 
      const dataStr = data.toString();
      errorOutput += dataStr;
      console.log('[DEBUG] Script stderr:', dataStr);
    });
    
    py.on('close', (code) => {
      console.log('[DEBUG] Script terminó con código:', code);
      console.log('[DEBUG] Output completo:', output);
      console.log('[DEBUG] Error output:', errorOutput);
      console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
      
      try {
        if (lastJsonOutput && lastJsonOutput.success) {
          console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
          
          // Ejecutar auto_scheduler automáticamente después de programar exitosamente
          console.log('[DEBUG] Ejecutando auto_scheduler automáticamente...');
          const autoSchedulerPath = path.join(__dirname, 'python', 'auto_scheduler.py');
          const autoSchedulerPy = spawn('python', [autoSchedulerPath, token], { cwd: path.dirname(autoSchedulerPath) });
          
          autoSchedulerPy.on('close', (autoSchedulerCode) => {
            console.log('[DEBUG] Auto scheduler terminó con código:', autoSchedulerCode);
            res.json(lastJsonOutput);
          });
          
          autoSchedulerPy.on('error', (autoSchedulerError) => {
            console.log('[DEBUG] Error ejecutando auto scheduler:', autoSchedulerError);
            res.json(lastJsonOutput);
          });
        } else {
          // Fallback: intentar parsear toda la salida
          const json = JSON.parse(output);
          console.log('[DEBUG] JSON parseado del output completo:', json);
          res.json(json);
        }
      } catch (e) {
        console.log('[ERROR] Error parseando JSON:', e);
        console.log('[ERROR] Output que causó el error:', output);
        res.status(500).json({ error: 'Error ejecutando script', details: output });
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Error programando video', details: e.message });
  }
});

app.post('/api/instagram/schedule-story', async (req, res) => {
  console.log('[DEBUG] === Endpoint schedule-story llamado ===');
  console.log('[DEBUG] Body recibido:', req.body);
  
  const { media_url, date, time, token } = req.body;
  if (!media_url || !date || !time || !token) {
    console.log('[ERROR] Faltan parámetros:', { media_url: !!media_url, date: !!date, time: !!time, token: !!token });
    return res.status(400).json({ error: 'Faltan parámetros obligatorios' });
  }
  
  // Convertir fecha y hora a timestamp
  const fecha_dt = new Date(`${date}T${time}`);
  const scheduled_time = Math.floor(fecha_dt.getTime() / 1000);
  
  console.log('[DEBUG] Fecha programada:', fecha_dt);
  console.log('[DEBUG] Timestamp:', scheduled_time);
  
  try {
    console.log('[DEBUG] Ejecutando script de programación de historia...');
    const scriptPath = path.join(__dirname, 'python', 'create_instagram_story_scheduled.py');
    const args = ['--media_url', media_url, '--scheduled_time', scheduled_time.toString(), token];
    
    console.log('[DEBUG] Script path:', scriptPath);
    console.log('[DEBUG] Argumentos:', args);
    const { spawn } = require('child_process');
    const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
    
    let output = '';
    let errorOutput = '';
    let lastJsonOutput = null;
    
    py.stdout.on('data', (data) => { 
      const dataStr = data.toString();
      output += dataStr;
      console.log('[DEBUG] Script stdout:', dataStr);
      
      // Buscar el último JSON válido en la salida
      const lines = output.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('{') && line.endsWith('}')) {
          try {
            lastJsonOutput = JSON.parse(line);
            break;
          } catch (e) {
            // Continuar buscando
          }
        }
      }
    });
    
    py.stderr.on('data', (data) => { 
      const dataStr = data.toString();
      errorOutput += dataStr;
      console.log('[DEBUG] Script stderr:', dataStr);
    });
    
    py.on('close', (code) => {
      console.log('[DEBUG] Script terminó con código:', code);
      console.log('[DEBUG] Output completo:', output);
      console.log('[DEBUG] Error output:', errorOutput);
      console.log('[DEBUG] Último JSON encontrado:', lastJsonOutput);
      
      try {
        if (lastJsonOutput && lastJsonOutput.success) {
          console.log('[DEBUG] JSON parseado exitosamente:', lastJsonOutput);
          
          // Ejecutar auto_scheduler automáticamente después de programar exitosamente
          console.log('[DEBUG] Ejecutando auto_scheduler automáticamente...');
          const autoSchedulerPath = path.join(__dirname, 'python', 'auto_scheduler.py');
          const autoSchedulerPy = spawn('python', [autoSchedulerPath, token], { cwd: path.dirname(autoSchedulerPath) });
          
          autoSchedulerPy.on('close', (autoSchedulerCode) => {
            console.log('[DEBUG] Auto scheduler terminó con código:', autoSchedulerCode);
            res.json(lastJsonOutput);
          });
          
          autoSchedulerPy.on('error', (autoSchedulerError) => {
            console.log('[DEBUG] Error ejecutando auto scheduler:', autoSchedulerError);
            res.json(lastJsonOutput);
          });
        } else {
          // Fallback: intentar parsear toda la salida
          const json = JSON.parse(output);
          console.log('[DEBUG] JSON parseado del output completo:', json);
          res.json(json);
        }
      } catch (e) {
        console.log('[ERROR] Error parseando JSON:', e);
        console.log('[ERROR] Output que causó el error:', output);
        res.status(500).json({ error: 'Error ejecutando script', details: output });
      }
    });
  } catch (e) {
    res.status(500).json({ error: 'Error programando historia', details: e.message });
  }
});

// Endpoint para crear carrusel de Instagram
app.post('/api/instagram/create-carousel', (req, res) => {
  console.log('[DEBUG] ===== ENDPOINT CREATE-CAROUSEL LLAMADO =====');
  console.log('[DEBUG] Backend recibió request:', req.body);
  console.log('[DEBUG] Content-Type:', req.headers['content-type']);
  
  const { image_urls, caption, token } = req.body;
  
  console.log('[DEBUG] Token recibido:', token ? 'SÍ' : 'NO');
  console.log('[DEBUG] Image URLs:', image_urls);
  console.log('[DEBUG] Caption:', caption);
  
  if (!image_urls || !Array.isArray(image_urls) || image_urls.length < 2) {
    console.log('[DEBUG] Error: URLs inválidas');
    return res.status(400).json({ error: 'Se requieren al menos 2 URLs de imágenes para crear una publicación' });
  }
  
  if (image_urls.length > 10) {
    return res.status(400).json({ error: 'Máximo 10 imágenes permitidas' });
  }
  
  if (!caption || caption.trim() === '') {
    console.log('[DEBUG] Error: Caption vacío');
    return res.status(400).json({ error: 'El caption es requerido' });
  }
  
  if (!token) {
    console.log('[DEBUG] Error: Token no proporcionado');
    return res.status(400).json({ error: 'Token de Instagram requerido' });
  }
  
  console.log('[DEBUG] Ejecutando script Python...');
  const scriptPath = path.join(__dirname, 'python', 'create_instagram_carousel.py');
  
  // Verificar si el archivo existe
  const fs = require('fs');
  if (!fs.existsSync(scriptPath)) {
    console.log('[DEBUG] Error: Script Python no encontrado en:', scriptPath);
    return res.status(500).json({ error: 'Script Python no encontrado' });
  }
  
  const args = ['--image_urls', ...image_urls, '--caption', caption, token];
  console.log('[DEBUG] Args para Python:', args);
  
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, ...args], { cwd: path.dirname(scriptPath) });
  let output = '';
  let errorOutput = '';
  
  py.stdout.on('data', (data) => { 
    console.log('[DEBUG] Python stdout:', data.toString());
    output += data.toString(); 
  });
  
  py.stderr.on('data', (data) => { 
    console.log('[DEBUG] Python stderr:', data.toString());
    errorOutput += data.toString(); 
  });
  
  py.on('close', (code) => {
    console.log('[DEBUG] Python script terminó con código:', code);
    console.log('[DEBUG] Output completo:', output);
    console.log('[DEBUG] Error output:', errorOutput);
    try {
      const json = JSON.parse(output);
      if (json.success) {
        res.json({ 
          success: true, 
          message: 'Publicación realizada con éxito',
          post_id: json.response.id,
          caption: caption,
          image_count: image_urls.length
        });
      } else {
        res.status(500).json({ 
          error: 'Error creando publicación', 
          details: json.error 
        });
      }
    } catch (e) {
      res.status(500).json({ error: 'Error ejecutando script', details: output });
    }
  });
});

// Endpoint para ejecutar el script de historias
app.post('/api/instagram/update-stories', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  const scriptPath = path.join(__dirname, 'python', 'save_instagram_stories.py');
  const { spawn } = require('child_process');
  const py = spawn('python', [scriptPath, token], { cwd: path.dirname(scriptPath) });
  let output = '';
  let errorOutput = '';
  
  py.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  py.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });
  
  py.on('close', (code) => {
    if (code === 0) {
      try {
        // Leer el archivo de historias generado
        const storiesPath = path.join(__dirname, 'python', 'instagram_stories.json');
        if (fs.existsSync(storiesPath)) {
          const storiesData = fs.readFileSync(storiesPath, 'utf8');
          const stories = JSON.parse(storiesData);
          
          res.json({
            success: true,
            message: 'Historias actualizadas correctamente',
            stories: stories.stories || [],
            total: stories.metadata?.total_stories || 0
          });
        } else {
          res.json({
            success: true,
            message: 'No se encontraron historias',
            stories: [],
            total: 0
          });
        }
      } catch (e) {
        res.status(500).json({ error: 'Error al leer las historias' });
      }
    } else {
      res.status(500).json({ error: `Error ejecutando script: ${errorOutput}` });
    }
  });
});

// Endpoint para leer el archivo JSON de historias
app.get('/api/instagram/stories', (req, res) => {
  const storiesPath = path.join(__dirname, 'python', 'instagram_stories.json');
  try {
    if (!fs.existsSync(storiesPath)) {
      return res.json({ stories: [], metadata: { total_stories: 0 } });
    }
    const storiesData = fs.readFileSync(storiesPath, 'utf8');
    const stories = JSON.parse(storiesData);
    res.json(stories);
  } catch (error) {
    console.error('Error al leer instagram_stories.json:', error);
    res.status(500).json({ error: 'Error al leer las historias' });
  }
});

app.post('/api/instagram/suggestions', async (req, res) => {
  try {
    const postsPath = path.join(__dirname, 'python', 'instagram_posts.json');
    const scheduledPath = path.join(__dirname, 'python', 'scheduled_posts.json');
    const detailsPath = path.join(__dirname, 'python', 'instagram_details.json');
    const demographicsPath = path.join(__dirname, 'python', 'demographics_history.json');
    const followerInsightsPath = path.join(__dirname, 'python', 'follower_insights.json');
    
    const allPosts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
    const scheduled = fs.existsSync(scheduledPath) ? JSON.parse(fs.readFileSync(scheduledPath, 'utf8')) : [];
    const details = fs.existsSync(detailsPath) ? JSON.parse(fs.readFileSync(detailsPath, 'utf8')) : {};
    const demographics = fs.existsSync(demographicsPath) ? JSON.parse(fs.readFileSync(demographicsPath, 'utf8')) : {};
    const followerInsights = fs.existsSync(followerInsightsPath) ? JSON.parse(fs.readFileSync(followerInsightsPath, 'utf8')) : {};
    
    // Función para obtener muestra aleatoria de posts
    const getRandomSample = (posts, sampleSize = 13) => {
      if (posts.length <= sampleSize) {
        return posts; // Si hay menos posts que el tamaño de muestra, devolver todos
      }
      
      // Crear una copia del array para no modificar el original
      const shuffled = [...posts];
      
      // Algoritmo Fisher-Yates para mezclar aleatoriamente
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Tomar los primeros 'sampleSize' elementos
      return shuffled.slice(0, sampleSize);
    };
    
    // Obtener muestra aleatoria de posts (13-18 posts)
    const sampleSize = Math.min(18, Math.max(13, Math.floor(allPosts.length * 0.3))); // Entre 13-18 posts o 30% del total
    const posts = getRandomSample(allPosts, sampleSize);
    
    console.log(`Muestreo estadístico: ${allPosts.length} posts totales → ${posts.length} posts para IA`);
    
    // Construir prompt mejorado con análisis de patrones y demografía
    const prompt = `Eres un experto en marketing digital para Instagram. Analiza los siguientes datos de la cuenta incluyendo demografía, insights de seguidores, publicaciones y estadísticas (no recomiendes el uso de herramientas nativas de Instagram, tú eres la herramienta de análisis y recomendación). 

DATOS A ANALIZAR (muestra representativa de ${posts.length} posts de ${allPosts.length} totales):
1. Información general de la cuenta: ${JSON.stringify(details, null, 2)}
2. Historial de demografía: ${JSON.stringify(demographics, null, 2)}
3. Insights de seguidores: ${JSON.stringify(followerInsights, null, 2)}
4. Publicaciones actuales (muestra aleatoria): ${JSON.stringify(posts, null, 2)}
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

// Endpoint para obtener el token actual (para el auto_scheduler)
app.get('/api/instagram/current-token', (req, res) => {
  console.log('[DEBUG] === Endpoint current-token llamado ===');
  
  // Obtener el token del header Authorization o del query parameter
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (queryToken) {
    token = queryToken;
  }
  
  if (!token) {
    console.log('[ERROR] No se proporcionó token');
    return res.status(400).json({ error: 'Token requerido' });
  }
  
  console.log('[DEBUG] Token proporcionado:', token ? 'SÍ' : 'NO');
  
  // Guardar el token en un archivo temporal para que el auto_scheduler lo use
  const fs = require('fs');
  const path = require('path');
  const tokenFile = path.join(__dirname, 'python', 'current_token.txt');
  
  try {
    fs.writeFileSync(tokenFile, token);
    console.log('[DEBUG] Token guardado en archivo temporal');
    res.json({ success: true, message: 'Token actualizado' });
  } catch (error) {
    console.log('[ERROR] Error guardando token:', error);
    res.status(500).json({ error: 'Error guardando token' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor IA escuchando en http://localhost:${PORT}`);
}); 