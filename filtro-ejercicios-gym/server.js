const jwt = require('jsonwebtoken');
const SECRET = 'mi_clave_secreta_123';
const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const fs = require('fs');

const app = express();

app.use(function(req, res, next) {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

async function obtenerEjercicios(grupo) {
  try {
    const data = await fs.promises.readFile('./ejercicios.json', 'utf8');
    const ejercicios = JSON.parse(data);
    const resultado = ejercicios.filter(function(e) {
      return e.grupoMuscular === grupo;
    });
    return resultado;
  } catch(error) {
    throw error;
  }
}

function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token requerido');
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded.usuario;
    next();
  } catch(error) {
    res.status(401).send('Token inválido');
  }
}

app.get('/ejercicios/:grupo/rutina/:nivel', async function(req, res) {
  const grupo = req.params.grupo;
  const nivel = req.params.nivel;

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const respuesta = await client.chat.completions.create({
      model: 'openrouter/free',
      messages: [
        {
          role: 'user',
          content: `Creame una rutina de entrenamiento para el grupo muscular ${grupo} para un nivel ${nivel}. Devolvé solo los ejercicios, series y repeticiones.`
        }
      ]
    });
    res.send(respuesta.choices[0].message.content);
  } catch(error) {
    console.log(error);
    res.status(500).send('Error al generar la rutina');
  }
});

app.get('/musculos/:grupo', async function(req, res) {
  const grupo = req.params.grupo;

  try {
    const respuesta = await axios.get('https://wger.de/api/v2/muscle/');
    const musculos = respuesta.data.results;
    const resultado = musculos.filter(function(m) {
      return m.name_en.toLowerCase() === grupo.toLowerCase();
    });

    if (resultado.length === 0) {
      res.status(404).send('No se encontró ese grupo muscular');
    } else {
      res.json(resultado);
    }
  } catch(error) {
    console.log(error);
    res.status(500).send('Error al obtener información');
  }
});

app.post('/login', function(req, res) {
  const { usuario, password } = req.body;

  if (usuario === 'facundo' && password === '1234') {
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Usuario o contraseña incorrectos');
  }
});

app.post('/ejercicios', async function(req, res) {
  const nuevoEjercicio = req.body;
  console.log(nuevoEjercicio);
  res.json(nuevoEjercicio);
});

app.get('/ejercicios', verificarToken, async function(req, res) {
  try {
    const data = await fs.promises.readFile('./ejercicios.json', 'utf8');
    const ejercicios = JSON.parse(data);
    res.json(ejercicios);
  } catch(error) {
    res.status(500).send('Error al leer el archivo');
  }
});

app.get('/ejercicios/:grupo', async function(req, res) {
  const grupo = req.params.grupo;

  try {
    const resultado = await obtenerEjercicios(grupo);
    if (resultado.length === 0) {
      res.status(404).send('No se encontraron ejercicios para ese grupo muscular');
    } else {
      res.json(resultado);
    }
  } catch(error) {
    res.status(500).send('Error al leer el archivo');
  }
});

app.listen(3000, function() {
  console.log('Servidor corriendo en el puerto 3000');
});

process.on('uncaughtException', function(error) {
  console.log('Error:', error);
});