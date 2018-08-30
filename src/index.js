const GoogleSpreadsheet = require("google-spreadsheet");

// internally, col titles are much simpler
// (due to the fact they are XML nodes in gdocs API)
const getCleanTitle = title =>
  title.toLowerCase().replace(/[ _:\/#\|@\\]/gi, "");

const fetchData = (worksheet, colTitles, formatCell, cb) => {
  worksheet.getRows(
    {
      start: 0,
      num: worksheet.rowCount
    },
    (err, rows) => {
      if (err) {
        return cb(err);
      }
      cb(
        null,
        rows.map(row => {
          const cleanRow = {};

          colTitles.forEach(title => {
            // for some reason, keys are lower-cased in google xml api
            cleanRow[title] = formatCell(
              row[getCleanTitle(title)] || null,
              worksheet.title,
              title
            );
          });
          return cleanRow;
        })
      );
    }
  );
};

/**
 * fetch given worksheet data, arranging in JSON
 * return an array of objects with properties from column headers
 */
const extractSheet = ({ worksheet, formatCell = a => a }, cb) => {
  // fetch column headers first
  worksheet.getCells(
    {
      "min-row": 1,
      "max-row": 1,
      "min-col": 1,
      "max-col": parseInt(worksheet.colCount, 10)
    },
    (err, rows) => {
      if (err) {
        return cb(err);
      }
      const colTitles = rows.map(row => row.value);
      // then fetch datas
      fetchData(worksheet, colTitles, formatCell, cb);
    }
  );
};

const extractSheetsFromSpreadsheet = (
  spreadSheet,
  sheetsToExtract,
  formatCell = a => a,
  cb
) => {
  spreadSheet.getInfo((err, sheetInfo) => {
    if (err) {
      return cb(err);
    }

    const sheetsNames = sheetInfo.worksheets.map(sheet => sheet.title);
    const results = {};
    if (sheetsToExtract.length === 0) {
      sheetsToExtract = sheetsNames;
    }

    const getWorkSheetData = (name, cb2) => {
      const worksheet = sheetInfo.worksheets[sheetsNames.indexOf(name)];
      if (!worksheet) {
        return cb2(null, []);
      }
      extractSheet({ worksheet, formatCell }, cb2);
    };

    sheetsToExtract.map(table => {
      getWorkSheetData(table, (err, data) => {
        if (err) {
          return cb(err);
        }
        results[table] = data;
        if (Object.keys(results).length === sheetsToExtract.length) {
          cb(null, results);
        }
      });
    });
  });
};

/**
 * fetch N sheets from the given spreadsheet and return a single JSON using extractSheet function
 */
const extractSheets = (
  {
    spreadsheetKey,
    sheetsToExtract = [],
    credentials,
    formatCell = a => a
  } = {},
  cb
) => {
  const spreadSheet = new GoogleSpreadsheet(spreadsheetKey);

  if (!credentials) {
    return extractSheetsFromSpreadsheet(
      spreadSheet,
      sheetsToExtract,
      formatCell,
      cb
    );
  }

  spreadSheet.useServiceAccountAuth(credentials, err => {
    if (err) {
      return cb(err);
    }
    extractSheetsFromSpreadsheet(spreadSheet, sheetsToExtract, formatCell, cb);
  });
};

module.exports = {
  extractSheet,
  extractSheets
};
