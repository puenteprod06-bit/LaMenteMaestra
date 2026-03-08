const mysql = require("mysql2");

const db = mysql.createPool({
  host: "srv798.hstgr.io",
  user: "u445028788_lamentemaestra",
  password: ">Yd7/yo1?Vs",
  database: "u445028788_lamentemaestra",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error conectando a MySQL:", err);
  } else {
    console.log("Conectado a MySQL");
    connection.release();
  }
});

module.exports = db;