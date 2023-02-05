const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const conn = require("./DBConnect");

function createWindow() {
  const win = new BrowserWindow({
    minWidth: 800,
    minHeight: 500,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "src", "js", "script.js"),
      devTools: false,
    },
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "public", "favicon.png"),
  });
  win.loadFile("src/index.html");
  win.maximize();
  win.once("ready-to-show", function () {
    win.show();
  });
}

ipcMain.on("add-client", (event, newClientInfo) => {
  // console.log(newClientInfo);
  // let sql = `INSERT INTO electronjs (client_name, client_work, client_salary, client_work_in, client_work_out) VALUES (${newClient.client_name},${newClient.client_work}, ${newClient.client_salary}, ${newClient.client_work_in}, ${newClient.client_work_out})`;
  addClient(event, newClientInfo);
});

ipcMain.on("get-all-clients", function (event) {
  getAllClients(event);
});

ipcMain.on("get-single-client-info", function (event, clientId) {
  getSingleClientInfo(event, clientId);
});

ipcMain.on("delete-single-client", function (event, clientId) {
  deleteSingleClient(event, clientId);
});

ipcMain.on("update-client", function (event, selectedClientInfo) {
  updateClient(event, selectedClientInfo);
});

function updateClient(event, selectedClientInfo) {
  let sql = `UPDATE clients SET client_name = ?, client_work = ?, client_salary = ?, client_work_in = ?, client_work_out = ? WHERE client_id = ?`;
  conn.query(
    sql,
    [
      selectedClientInfo.client_name_update,
      selectedClientInfo.client_work_update,
      selectedClientInfo.client_salary_update,
      selectedClientInfo.client_work_in_update,
      selectedClientInfo.client_work_out_update,
      selectedClientInfo.client_id_update,
    ],
    function (err, result) {
      if (err) throw err;
      event.sender.send("client-updated");
    }
  );
}

function deleteSingleClient(event, clientId) {
  let sql = "DELETE FROM clients WHERE client_id = ?";
  conn.query(sql, [clientId], function (err, result) {
    if (err) throw err;
    event.sender.send("single-client-deleted");
  });
}

// Get Single Client Info Function
function getSingleClientInfo(event, clientId) {
  let sql = "SELECT * FROM clients WHERE client_id = ?";
  conn.query(sql, [clientId], function (err, result) {
    if (err) throw err;
    event.sender.send("single-client-info-got", result[0]);
  });
}

// Add Client Function
function addClient(event, newClientInfo) {
  let sql = `INSERT INTO clients (client_name, client_work, client_salary, client_work_in, client_work_out) VALUES (?, ?, ?, ?, ?)`;
  conn.query(
    sql,
    [
      newClientInfo.client_name,
      newClientInfo.client_work,
      newClientInfo.client_salary,
      newClientInfo.client_work_in,
      newClientInfo.client_work_out,
    ],
    function (err, result) {
      if (err) throw err;
      event.sender.send("client-added");
    }
  );
}

function getAllClients(event) {
  let sql = "SELECT * FROM clients ORDER BY client_id DESC";
  conn.query(sql, function (err, result) {
    if (err) throw err;
    let allClientsInfo = result;
    event.sender.send("all-clients-got", result);
  });
}

app.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    app.quit();
  }
});

app.whenReady().then(() => {
  createWindow();
});
