const express = require('express');
const router = express.Router();
const fs = require('fs');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const SECRET = 'mi_clave_secreta_123';

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

async function obtenerEjercicios(grupo) {
  try {
    const data = await fs.promises.readFile('./ejercicios.json', 'utf8');
    const ejercicios = JSON.parse(data);
    return ejercicios.filter(function(e) {
      return e.grupoMuscular === grupo;
    });
  } catch(error) {
    throw error;
  }
}

router.get('/ejercicios', verificarToken, async function(req, res) {
  try {
    const data = await fs.promises.readFile('./ejercicios.json', 'utf8');
    const ejercicios = JSON.parse(data);
    res.json(ejercicios);
  } catch(error) {
    res.status(500).send('Error al leer el archivo');
  }
});

router.post('/ejercicios', async function(req, res) {
  const nuevoEjercicio = req.body;
  console.log(nuevoEjercicio);
  res.json(nuevoEjercicio);
});

router.get('/ejercicios/:grupo', async function(req, res) {
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

router.get('/ejercicios/:grupo/rutina/:nivel', async function(req, res) {
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

module.exports = router;