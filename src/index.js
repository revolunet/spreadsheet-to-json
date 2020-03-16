const { GoogleSpreadsheet } = require("google-spreadsheet");

/**
 * fetch given worksheet data, arranging in JSON
 * return an array of objects with properties from column headers
 */
const extractSheet = async ({ worksheet, formatCell = a => a }, cb) => {
  // fetch column headers first
  if (!worksheet) {
    return [];
  }
  await worksheet.loadHeaderRow();
  const colTitles = worksheet.headerValues;
  const rows = await worksheet.getRows({
    offset: 0,
    limit: worksheet.rowCount
  });
  const rowsData = rows.map(row => {
    const cleanRow = {};
    colTitles.forEach(title => {
      cleanRow[title] = formatCell(row[title] || null, worksheet.title, title);
    });
    return cleanRow;
  });
  if (cb) {
    cb(null, rowsData);
  }
  return rowsData;
};

/**
 * fetch N sheets from the given spreadsheet and return a single JSON using extractSheet function
 */
const extractSheets = async (
  {
    spreadsheetKey,
    sheetsToExtract = [],
    credentials,
    formatCell = a => a
  } = {},
  cb
) => {
  const spreadSheet = new GoogleSpreadsheet(spreadsheetKey);

  if (typeof credentials === "string") {
    await spreadSheet.useApiKey(credentials);
  } else if (typeof credentials === "object") {
    await spreadSheet.useServiceAccountAuth(credentials);
  } else {
    await spreadSheet.useApiKey(process.env.SPREADSHEET_API_KEY);
  }

  await spreadSheet.loadInfo();

  const sheetsNames = Array.from(
    { length: spreadSheet.sheetCount },
    (k, v) => spreadSheet.sheetsByIndex[v].title
  );

  const results = {};
  if (sheetsToExtract.length === 0) {
    sheetsToExtract = sheetsNames;
  }

  const sheetsData = await sheetsToExtract.reduce(async (all, title) => {
    const sheetData = await extractSheet({
      worksheet: spreadSheet.sheetsByIndex[sheetsNames.indexOf(title)],
      formatCell
    });
    return {
      ...(await all),
      [title]: sheetData
    };
  }, {});

  if (cb) {
    cb(null, sheetsData);
  }
  return sheetsData;
};

module.exports = {
  extractSheet,
  extractSheets
};
