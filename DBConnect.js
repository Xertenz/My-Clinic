const mysql = require("mysql");
const config = require("./DBConfig.json");

const conn = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

conn.connect(function (err) {
  if (err) {
    throw err;
  }
});

module.exports = conn;
