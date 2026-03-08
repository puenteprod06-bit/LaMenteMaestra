const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "usuario",
  password: "password",
  database: "database"
});

module.exports = db;
