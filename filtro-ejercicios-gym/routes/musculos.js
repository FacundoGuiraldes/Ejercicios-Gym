const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/musculos/:grupo', async function(req, res) {
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

module.exports = router;