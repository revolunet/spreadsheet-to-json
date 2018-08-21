const { extractSheets } = require(".");

const spreadsheetKey = "1mZoT4mEXNp8uR-thIQ2wN5TeJ76AWZd6c_GpaH-lLK0"; //1mZoT4l0AX8uR-thI232wN5TezefAWZd6c_GpaH-lLK0";
const credentials = require("./client_id.json");

extractSheets(
  {
    spreadsheetKey,
    credentials
  },
  (err, data) => {
    console.log(JSON.stringify({ err, data }, null, 2));
  }
);
