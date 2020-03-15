const GoogleSpreadsheet = require("google-spreadsheet");

// internally, col titles are much simpler
// (due to the fact they are XML nodes in gdocs API)
const getCleanTitle = title =>
  title.toLowerCase().replace(/[ _:\/#\|@\\]/gi, "");

const getCleanRowToColumns = (formatCell, row, title, cleanRow, worksheet) => {
    if (!cleanRow[title]) {
        cleanRow[title] = formatCell(row[getCleanTitle(title)] || null, worksheet.title, title);
    }
    else {
        var position = 2;
        while (cleanRow[title + '_' + position]) {
            position++;
        }
            cleanRow[title + '_' + position] = formatCell(row[title + '_' + position] || null, worksheet.title, title + '_' + position);
    }
};

const getCleanRow = (formatCell, row, title, cleanRow, worksheet, titleToArray) => {
    if (Array.isArray(cleanRow[title]) && titleToArray) {
        var position = cleanRow[title].length + 1;
        cleanRow[title].push(formatCell(row[title + '_' + position] || null, worksheet.title, title));        
    } else if (cleanRow[title] && titleToArray) {
            cleanRow[title] = [cleanRow[title], formatCell(row[title + '_2'] || null, worksheet.title, title)];
    }
    else {
        // for some reason, keys are lower-cased in google xml api
        cleanRow[title] = formatCell(row[getCleanTitle(title)] || null, worksheet.title, title);
    }
};

const fetchData = (worksheet, colTitles, formatCell, cb, toArray, toColumn) => {
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
            var titleToArray, titleToColumn = 0;
            if (toArray) {
                titleToArray = toArray.find( element => element === title);
            }
            if (toColumn) {
                titleToColumn = toColumn.find( element => element === title);
            }
            if (!titleToColumn && titleToArray) {
                getCleanRow(formatCell, row, title, cleanRow, worksheet, titleToArray);
            } else {
                getCleanRowToColumns(formatCell, row, title, cleanRow, worksheet);
            }
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
const extractSheet = ({ worksheet, formatCell = a => a }, cb, toArray, toColumn) => {
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
      fetchData(worksheet, colTitles, formatCell, cb, toArray, toColumn);
    }
  );
};

const extractSheetsFromSpreadsheet = (
  spreadSheet,
  sheetsToExtract,
  formatCell = a => a,
  cb,
  toArray,
  toColumn
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
      extractSheet({ worksheet, formatCell }, cb2, toArray, toColumn);
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
    toArray,
    toColumn,
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
      cb,
      toArray,
      toColumn
    );
  }

  spreadSheet.useServiceAccountAuth(credentials, err => {
    if (err) {
      return cb(err);
    }
    extractSheetsFromSpreadsheet(spreadSheet, sheetsToExtract, formatCell, cb, toArray, toColumn);
  });
};

module.exports = {
  extractSheet,
  extractSheets
};
