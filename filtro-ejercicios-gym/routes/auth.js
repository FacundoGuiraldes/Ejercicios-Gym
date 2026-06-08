const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SECRET = 'mi_clave_secreta_123';

router.post('/login', function(req, res) {
  const { usuario, password } = req.body;

  if (usuario === 'facundo' && password === '1234') {
    const token = jwt.sign({ usuario }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Usuario o contraseña incorrectos');
  }
});

module.exports = router;