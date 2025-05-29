// config.js
require('dotenv').config();
const mysql = require('mysql2');

// Create a MySQL connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

const pool = mysql.createPool({
  host: 'hapest-hafiz-ab2a.g.aivencloud.com',
  port: 25524,
  user: 'avnadmin',
  password: 'AVNS_m0tSO8YhYx3D3c92pch',
  database: 'fyp',
  connectTimeout: 100000,
});

const db = pool.promise();  // Using promise-based queries

module.exports = db;
