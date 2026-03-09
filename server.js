const express = require("express");
const mysql = require("mysql2");

const app = express();

const db = mysql.createPool({
  host: "srv798.hstgr.io.",
  user: "u445028788_lamentemaestra",
  password: "0b?X#AW6y*F",
  database: "u445028788_lamentemaestra",
  port: 3306
});

app.get("/", (req, res) => {
  db.query("SELECT 1", (err, result) => {
    if (err) {
      console.error(err);
      res.send("Error MySQL: " + err.message);
    } else {
      res.send("Servidor y base de datos funcionando 🚀");
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});

















