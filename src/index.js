
import fs from 'fs';
import GoogleSpreadsheet from 'google-spreadsheet';


/**
 * fetch given worksheet data, arranging in JSON
 * return an array of objects with properties from column headers
 */
function extractSheet(worksheet, cb) {
    // fetch column headers
    worksheet.getCells({
        'min-row': 1,
        'max-row': 1,
        'min-col': 1,
        'max-col': worksheet.colCount
    }, function(err, rows) {
        var colTitles = rows.map(row => row.value);
        fetchData(worksheet, colTitles, cb);
    });

    function fetchData(worksheet, colTitles, cb) {
        worksheet.getRows({
            'start': 0,
            'num': worksheet.rowCount
        }, function(err, rows) {
            cb(rows.map(row => {
                let cleanRow = {};
                colTitles.forEach(title => {
                    cleanRow[title] = row[title] || null;
                });
                return cleanRow;
            }));
        });
    }
}

/**
 * fetch N sheets from the given spreadsheet and return a single JSON using extractSheet function
 */
export default function extractSheets(spreadsheetKey, sheetsToExtract, credentials, cb) {
    var spreadSheet = new GoogleSpreadsheet(spreadsheetKey);
    spreadSheet.useServiceAccountAuth(credentials, function(err){

        spreadSheet.getInfo( function( err, sheetInfo ){

            function getWorkSheetData(name, cb2) {
                var worksheet = sheetInfo.worksheets[sheetsNames.indexOf(name)];
                extractSheet(worksheet, data2 => {
                    cb2(data2);
                });
            }

            var sheetsNames = sheetInfo.worksheets.map(sheet => sheet.title);
            var results = {}

            sheetsToExtract.map(table => {
                getWorkSheetData(table, data => {
                    results[table] = data;
                    if (Object.keys(results).length === sheetsToExtract.length) {
                        cb(results);
                    }
                });
            });

        });
    });
};
