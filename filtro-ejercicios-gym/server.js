require('dotenv').config();
const express = require('express');

const app = express();

app.use(express.json());

app.use(function(req, res, next) {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

app.use(require('./routes/auth'));
app.use(require('./routes/musculos'));
app.use(require('./routes/ejercicios'));

app.listen(3000, function() {
  console.log('Servidor corriendo en el puerto 3000');
});

process.on('uncaughtException', function(error) {
  console.log('Error:', error);
});