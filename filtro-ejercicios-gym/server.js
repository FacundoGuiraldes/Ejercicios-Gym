const express = require('express');
const ejercicios = require('./ejercicios.json');

const app = express();

app.get('/:grupo', function(req, res) {
  const grupo = req.params.grupo;
  const resultado = ejercicios.filter(function(e) {
    return e.grupoMuscular === grupo;
  });

  if (resultado.length === 0) {
    res.status(404).send('No se encontraron ejercicios para ese grupo muscular');
  } else {
    res.send(resultado);
  }
});

app.listen(3000, function() {
  console.log('Servidor corriendo en el puerto 3000');
});