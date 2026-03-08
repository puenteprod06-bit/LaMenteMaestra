const express = require("express");
const mysql = require("mysql2");

const app = express();

const db = mysql.createPool({
  host: "srv798.hstgr.io",
  user: "u445028788_lamentemaestra",
  password: "TU_PASSWORD",
  database: "u445028788_lamentemaestra",
  port: 3306
});

app.get("/", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      res.send("Error conectando a la base");
      console.error(err);
    } else {
      res.send("Base de datos conectada correctamente 🚀");
    }
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});
