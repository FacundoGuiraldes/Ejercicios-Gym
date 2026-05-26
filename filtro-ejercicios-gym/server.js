const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const fs = require('fs');

const app = express();

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

app.get('/rutina/:grupo/:nivel', async function(req, res) {
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

app.get('/info/:grupo', async function(req, res) {
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
      res.send(resultado);
    }
  } catch(error) {
    console.log(error);
    res.status(500).send('Error al obtener información');
  }
});

app.get('/:grupo', async function(req, res) {
  const grupo = req.params.grupo;

  try {
    const resultado = await obtenerEjercicios(grupo);
    if (resultado.length === 0) {
      res.status(404).send('No se encontraron ejercicios para ese grupo muscular');
    } else {
      res.send(resultado);
    }
  } catch(error) {
    res.status(500).send('Error al leer el archivo');
  }
});

app.listen(3000, function() {
  console.log('Servidor corriendo en el puerto 3000');
});