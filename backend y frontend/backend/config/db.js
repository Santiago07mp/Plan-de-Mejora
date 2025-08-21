const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // ⚠️ cámbialo según tu MySQL
  password: '1234',     // ⚠️ pon tu clave
  database: 'gestor_tareas'
});

module.exports = pool;


