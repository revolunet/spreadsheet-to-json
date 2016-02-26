
import fs from 'fs';
import GoogleSpreadsheet from 'google-spreadsheet';

// internally, col titles are much simpler
// (due to the fact they are XML nodes in gdocs API)
function getCleanTitle(title) {
  return title.toLowerCase().replace(/[ #_]/gi, '')
}

/**
 * fetch given worksheet data, arranging in JSON
 * return an array of objects with properties from column headers
 */
export function extractSheet({worksheet, formatCell = a => a}, cb) {
    // fetch column headers first
    worksheet.getCells({
        'min-row': 1,
        'max-row': 1,
        'min-col': 1,
        'max-col': parseInt(worksheet.colCount, 10)
    }, function(err, rows) {
        if (err) {
            return cb(err);
        }
        var colTitles = rows.map(row => row.value);
        // then fetch datas
        fetchData(worksheet, colTitles, cb);
    });

    function fetchData(worksheet, colTitles, cb) {
        worksheet.getRows({
            'start': 0,
            'num': worksheet.rowCount
        }, function(err, rows) {
            if (err) {
                return cb(err);
            }
            cb(null, rows.map(row => {
                let cleanRow = {};

                colTitles.forEach(title => {
                    // for some reason, keys are lower-cased in google xml api
                    cleanRow[title] = formatCell(row[getCleanTitle(title)] || null, worksheet.title, title);
                });
                return cleanRow;
            }));
        });
    }
}

/**
 * fetch N sheets from the given spreadsheet and return a single JSON using extractSheet function
 */
export function extractSheets({spreadsheetKey, sheetsToExtract, credentials = {}, formatCell = a => a} = {}, cb) {
    var spreadSheet = new GoogleSpreadsheet(spreadsheetKey);
    spreadSheet.useServiceAccountAuth(credentials, function(err){
        if (err) {
            return cb(err);
        }
        spreadSheet.getInfo( function( err, sheetInfo ){
            if (err) {
                return cb(err);
            }

            var sheetsNames = sheetInfo.worksheets.map(sheet => sheet.title);
            var results = {}
            if (sheetsToExtract.length === 0) {
                sheetsToExtract = sheetsNames;
            }

            function getWorkSheetData(name, cb2) {
                var worksheet = sheetInfo.worksheets[sheetsNames.indexOf(name)];
                if (!worksheet) {
                  return cb2(null, []);
                }
                extractSheet({worksheet, formatCell}, cb2);
            }

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
    });
};
