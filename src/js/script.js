const { ipcRenderer } = require("electron");
const FormData = require("form-data");

window.addEventListener("DOMContentLoaded", () => {
  var dt = require("datatables.net")();

  // SideBar Tabs
  let items = document.querySelectorAll(".wrapper .menu .menu-item");
  items.forEach((singleItem) => {
    // Adding Click Event To All Items
    singleItem.addEventListener("click", function () {
      // Romoving Active Class From All Items
      items.forEach((item) => {
        item.classList.remove("active");
      });
      // Adding Active Class To Target Item
      singleItem.classList.add("active");

      let contentItem = singleItem.dataset.item;
      let contents = document.querySelectorAll(
        ".wrapper .contents .content-item"
      );
      contents.forEach((content) => {
        content.classList.remove("active");
      });
      document.querySelector(`.${contentItem}`).classList.add("active");
    });
  });

  // Clients Tabs
  let clientsTabs = document.querySelectorAll(
    ".content-item.item-clients .tabs-wrapper .tabs ul li"
  );
  clientsTabs.forEach((singleClientTab) => {
    // Adding Click Event To All Items
    singleClientTab.addEventListener("click", function () {
      // Romoving Active Class From All Items
      clientsTabs.forEach((tab) => {
        tab.classList.remove("active");
      });
      // Adding Active Class To Target Item
      singleClientTab.classList.add("active");

      let tabItem = singleClientTab.dataset.item;
      let tabsContents = document.querySelectorAll(
        ".content-item.item-clients .tabs-wrapper .tabs-contents .tab-content"
      );
      tabsContents.forEach((tabContent) => {
        tabContent.classList.remove("active");
      });
      document.querySelector(`.${tabItem}`).classList.add("active");
    });
  });

  // Start Displaying All clients
  ipcRenderer.send("get-all-clients");
  ipcRenderer.on("all-clients-got", function (event, allClientsInfo) {
    showAllClients(allClientsInfo);
  });
  // End Displaying All clients

  ipcRenderer.on("single-client-info-got", function (event, singleClientInfo) {
    activatingUpdateTabAndContent();
    prepareUpdatingClient(singleClientInfo);
  });

  // Start Adding Client
  let addClientForm = document.getElementById("add-client-form");
  addClientForm.addEventListener("submit", AddingClient);
  // End Adding Client

  // Closing Update Client Tab
  let closeUpdateTabBtn = document.getElementById("close-update-tab");
  closeUpdateTabBtn.addEventListener("click", () => {
    activatingAllClientsTabAndContent();
    hideUpdateTabAndContent();
  });
});

function AddingClient(e) {
  // Start Adding Client
  e.preventDefault();
  let addFormData = new FormData(this);

  let newClientInfo = {};
  for (let i = 0; i < addFormData.length - 1; i++) {
    newClientInfo[addFormData[i].name] = addFormData[i].value;
  }

  let newClientForm = this;

  ipcRenderer.send("add-client", newClientInfo);
  ipcRenderer.on("client-added", function (event, args) {
    newClientForm.reset();
    ipcRenderer.send("get-all-clients");
  });
  // End Adding Client
}

function showAllClients(allClientsInfo) {
  var $ = require("jquery");
  var allClientsDataTable = $("#all-clients-table").DataTable();
  allClientsDataTable.clear();
  for (let singleClientInfo of allClientsInfo) {
    allClientsDataTable.row
      .add([
        singleClientInfo.client_id,
        singleClientInfo.client_name,
        singleClientInfo.client_work,
        singleClientInfo.client_salary,
        singleClientInfo.client_work_in,
        singleClientInfo.client_work_out,
        `<div class="action-wrapper">
          <button data-client-id="${singleClientInfo.client_id}" class="client-update-btn btn btn-success btn-sm">
            <i class="fa fa-pen-to-square"></i>
            <span class="ms-1">Update</span>
          </button>
          <button data-client-id="${singleClientInfo.client_id}" class="client-delete-btn btn btn-danger btn-sm">
            <i class="fa fa-trash"></i>
            <span class="ms-1">Delete</span>
          </button>
        <div>`,
      ])
      .draw(false);
  }
  $("#all-clients-table tbody").on(
    "click",
    "td .client-update-btn",
    function (e) {
      editClient(this.dataset.clientId);
    }
  );
  $("#all-clients-table tbody").on(
    "click",
    "td .client-delete-btn",
    function (e) {
      let result = confirm("Are you sure ?");
      if (result) {
        deleteClient(this.dataset.clientId);
      }
    }
  );
}

// Sending Client ID And Getting Information
function editClient(clientId) {
  ipcRenderer.send("get-single-client-info", clientId);
}
// Sending Client ID And Delete Client
function deleteClient(clientId) {
  ipcRenderer.send("delete-single-client", clientId);
  ipcRenderer.on("single-client-deleted", function (event) {
    // Start Displaying All clients
    ipcRenderer.send("get-all-clients");
    // End Displaying All clients
  });
}

function prepareUpdatingClient(clientInfo) {
  // Injection Data To Fields
  let clientIdUpdate = document.getElementById("client_id_update");
  clientIdUpdate.value = clientInfo.client_id;
  clientIdUpdate.removeAttribute("disabled");
  clientIdUpdate.focus();
  clientIdUpdate.setAttribute("disabled", "disabled");

  let clientNameUpdate = document.getElementById("client_name_update");
  clientNameUpdate.value = clientInfo.client_name;
  clientNameUpdate.focus();

  let clientWorkUpdate = document.getElementById("client_work_update");
  clientWorkUpdate.value = clientInfo.client_work;
  clientWorkUpdate.focus();

  let clientSalaryUpdate = document.getElementById("client_salary_update");
  clientSalaryUpdate.value = clientInfo.client_salary;
  clientSalaryUpdate.focus();

  let clientWorkInUpdate = document.getElementById("client_work_in_update");
  clientWorkInUpdate.value = clientInfo.client_work_in;
  clientWorkInUpdate.focus();

  let clientWorkOutUpdate = document.getElementById("client_work_out_update");
  clientWorkOutUpdate.value = clientInfo.client_work_out;
  clientWorkOutUpdate.focus();
  clientWorkOutUpdate.blur();

  // Show Update Tab
  showUpdateTabAndContent();

  let updateClientForm = document.getElementById("update-client-form");
  updateClientForm.addEventListener("submit", updatingClient);
}

function showUpdateTabAndContent() {
  let updateTab = document.querySelector('li[data-item="update-client"]');
  updateTab.classList.remove("disabled");
}
function hideUpdateTabAndContent() {
  let updateTab = document.querySelector('li[data-item="update-client"]');
  updateTab.classList.add("disabled");
}

function updatingClient(e) {
  // Start Adding Client
  e.preventDefault();
  let updateFormData = new FormData(this);

  let selectedClientInfo = {};
  for (let i = 0; i < updateFormData.length - 1; i++) {
    selectedClientInfo[updateFormData[i].name] = updateFormData[i].value;
  }

  let updateClientForm = this;

  ipcRenderer.send("update-client", selectedClientInfo);
  ipcRenderer.on("client-updated", function (event, args) {
    updateClientForm.reset();
    ipcRenderer.send("get-all-clients");
    activatingAllClientsTabAndContent();
    hideUpdateTabAndContent();
  });
  // End Adding Client
}

function activatingAllClientsTabAndContent() {
  let clientsTabs = document.querySelectorAll(
    ".content-item.item-clients .tabs-wrapper .tabs ul li"
  );
  clientsTabs.forEach((singleClientTab) => {
    // Romoving Active Class From All Items
    singleClientTab.classList.remove("active");
    // Adding Active Class To Target Item
    let updateTab = document.querySelector('li[data-item="all-clients"]');
    updateTab.classList.add("active");

    let tabsContents = document.querySelectorAll(
      ".content-item.item-clients .tabs-wrapper .tabs-contents .tab-content"
    );
    tabsContents.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    document.querySelector(".tab-content.all-clients").classList.add("active");
  });
}

function activatingUpdateTabAndContent() {
  let clientsTabs = document.querySelectorAll(
    ".content-item.item-clients .tabs-wrapper .tabs ul li"
  );
  clientsTabs.forEach((singleClientTab) => {
    // Romoving Active Class From All Items
    singleClientTab.classList.remove("active");
    // Adding Active Class To Target Item
    let updateTab = document.querySelector('li[data-item="update-client"]');
    updateTab.classList.add("active");

    let tabsContents = document.querySelectorAll(
      ".content-item.item-clients .tabs-wrapper .tabs-contents .tab-content"
    );
    tabsContents.forEach((tabContent) => {
      tabContent.classList.remove("active");
    });
    document
      .querySelector(".tab-content.update-client")
      .classList.add("active");
  });
}
