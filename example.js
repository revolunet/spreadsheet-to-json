const { extractSheets } = require(".");

const spreadsheetKey = "1mZoT4mEXNp8uR-thIQ2wN5TeJ76AWZd6c_GpaH-lLK0";
const credentials = require("./client_id.json");

extractSheets(
  {
    spreadsheetKey
    // credentials
  },
  (err, data) => {
    if (err) {
      console.log("ERROR:", err);
    }
    console.log(JSON.stringify({ err, data }, null, 2));
  }
);
