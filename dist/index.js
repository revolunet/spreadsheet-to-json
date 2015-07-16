'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = extractSheets;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _googleSpreadsheet = require('google-spreadsheet');

var _googleSpreadsheet2 = _interopRequireDefault(_googleSpreadsheet);

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
    }, function (err, rows) {
        var colTitles = rows.map(function (row) {
            return row.value;
        });
        fetchData(worksheet, colTitles, cb);
    });

    function fetchData(worksheet, colTitles, cb) {
        worksheet.getRows({
            'start': 0,
            'num': worksheet.rowCount
        }, function (err, rows) {
            cb(rows.map(function (row) {
                var cleanRow = {};
                colTitles.forEach(function (title) {
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

function extractSheets(spreadsheetKey, sheetsToExtract, credentials, cb) {
    var spreadSheet = new _googleSpreadsheet2['default'](spreadsheetKey);
    spreadSheet.useServiceAccountAuth(credentials, function (err) {

        spreadSheet.getInfo(function (err, sheetInfo) {

            function getWorkSheetData(name, cb2) {
                var worksheet = sheetInfo.worksheets[sheetsNames.indexOf(name)];
                extractSheet(worksheet, function (data2) {
                    cb2(data2);
                });
            }

            var sheetsNames = sheetInfo.worksheets.map(function (sheet) {
                return sheet.title;
            });
            var results = {};

            sheetsToExtract.map(function (table) {
                getWorkSheetData(table, function (data) {
                    results[table] = data;
                    if (Object.keys(results).length === sheetsToExtract.length) {
                        cb(results);
                    }
                });
            });
        });
    });
}

;
module.exports = exports['default'];