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

// const connection = mysql.createConnection({
//   host: 'fyp.mysql.database.azure.com', // Azure MySQL host
//   user: 'hmu', // Your MySQL username
//   password: 'Osaid@284', // Your MySQL password
//   database: 'fyp', // Your database name
//   port: 3306, // MySQL port
//   connectTimeout: 10000, // Increase timeout if needed
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
