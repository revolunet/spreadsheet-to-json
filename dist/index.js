'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.extractSheet = extractSheet;
exports.extractSheets = extractSheets;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _googleSpreadsheet = require('google-spreadsheet');

var _googleSpreadsheet2 = _interopRequireDefault(_googleSpreadsheet);

// internally, col titles are much simpler
// (due to the fact they are XML nodes in gdocs API)
function getCleanTitle(title) {
    return title.toLowerCase().replace(/[ #_]/gi, '');
}

/**
 * fetch given worksheet data, arranging in JSON
 * return an array of objects with properties from column headers
 */

function extractSheet(_ref, cb) {
    var worksheet = _ref.worksheet;
    var _ref$formatCell = _ref.formatCell;
    var formatCell = _ref$formatCell === undefined ? function (a) {
        return a;
    } : _ref$formatCell;

    // fetch column headers first
    worksheet.getCells({
        'min-row': 1,
        'max-row': 1,
        'min-col': 1,
        'max-col': parseInt(worksheet.colCount, 10)
    }, function (err, rows) {
        if (err) {
            return cb(err);
        }
        var colTitles = rows.map(function (row) {
            return row.value;
        });
        // then fetch datas
        fetchData(worksheet, colTitles, cb);
    });

    function fetchData(worksheet, colTitles, cb) {
        worksheet.getRows({
            'start': 0,
            'num': worksheet.rowCount
        }, function (err, rows) {
            if (err) {
                return cb(err);
            }
            cb(null, rows.map(function (row) {
                var cleanRow = {};

                colTitles.forEach(function (title) {
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

function extractSheets(_x, cb) {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var spreadsheetKey = _ref2.spreadsheetKey;
    var sheetsToExtract = _ref2.sheetsToExtract;
    var _ref2$credentials = _ref2.credentials;
    var credentials = _ref2$credentials === undefined ? {} : _ref2$credentials;
    var _ref2$formatCell = _ref2.formatCell;
    var formatCell = _ref2$formatCell === undefined ? function (a) {
        return a;
    } : _ref2$formatCell;

    var spreadSheet = new _googleSpreadsheet2['default'](spreadsheetKey);
    spreadSheet.useServiceAccountAuth(credentials, function (err) {
        if (err) {
            return cb(err);
        }
        spreadSheet.getInfo(function (err, sheetInfo) {
            if (err) {
                return cb(err);
            }

            var sheetsNames = sheetInfo.worksheets.map(function (sheet) {
                return sheet.title;
            });
            var results = {};
            if (sheetsToExtract.length === 0) {
                sheetsToExtract = sheetsNames;
            }

            function getWorkSheetData(name, cb2) {
                var worksheet = sheetInfo.worksheets[sheetsNames.indexOf(name)];
                if (!worksheet) {
                    return cb2(null, []);
                }
                extractSheet({ worksheet: worksheet, formatCell: formatCell }, cb2);
            }

            sheetsToExtract.map(function (table) {
                getWorkSheetData(table, function (err, data) {
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
}

;