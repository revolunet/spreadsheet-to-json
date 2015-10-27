# spreadsheet-to-json

![npm](https://img.shields.io/npm/v/spreadsheet-to-json.svg) ![license](https://img.shields.io/npm/l/spreadsheet-to-json.svg) ![github-issues](https://img.shields.io/github/issues/revolunet/spreadsheet-to-json.svg) ![Circle CI build status](https://circleci.com/gh/revolunet/spreadsheet-to-json.svg?style=svg)

![nodei.co](https://nodei.co/npm/spreadsheet-to-json.png?downloads=true&downloadRank=true&stars=true)

Convert Google Spreadsheets to JSON using Javascript

Uses the [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) library to fetch data.

The final JSON is based on sheets names and column titles and finally looks like this :

```json
{
    "Customers": [{
            "name": "Sony",
            "country": "Japan"
        },{
            "name": "Renault",
            "country": "France"
        }
    ],
    "Invoices":  [{
            "id": "F0001",
            "totalAmount": "12367.12"
        },{
            "name": "F0002",
            "totalAmount": "4398.2"
        }
    ]
}
```

This is useful when you let people edit spreadsheets and need to work with the data.


## Install

`npm i --save spreadsheet-to-json`

## QuickStart

```js
var extractSheets = require('spreadsheet-to-json');

// optional custom format cell function
var formatCell = function(sheetTitle, columnTitle, value) {
    return value.toUpperCase();
};

extractSheets({
    // your google spreadhsheet key
    spreadsheetKey: 'abch54Ah75feBqKGiUjITgE9876Ypb0yE-abc',
    // your google oauth2 credentials
    credentials: require('./google-generated-creds.json'),
    // names of the sheet you want to extract (or [] for all)
    sheetsToExtract: ['Customers', 'Invoices'],
    // custom function to parse the cells
    formatCell: formatCell
}, function(data) {
    console.log('Customers: ', data.Customers);
    console.log('Invoices: ', data.Invoices);
});

```


## Authentification

Create a credentials.json file for your app here : https://console.developers.google.com/

 - create a new project
 - enable the Drive API
 - in **credentials**, select **create new client id** then **service account** and save the generated JSON. (privately)
 - the just paste the JSON contents as `credentials` in the `extractSheets` call.

Share the target google spreadsheet with the `client_email` from the credentials.json.

## Scripts

 - **npm run start** : `./node_modules/.bin/babel-node ./index`
 - **npm run readme** : `./node_modules/.bin/node-readme`
 - **npm run test** : `find ./spec -iname '*.spec.js' -exec ./node_modules/.bin/babel-node {} \; | ./node_modules/.bin/tap-spec`
 - **npm run build** : `./node_modules/.bin/babel -d ./dist ./src && npm run readme`
 - **npm run patch** : `npm run -s build && npm version patch && git push && npm publish`


## Dependencies

Package | Version | Dev
--- |:---:|:---:
[google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) | 1.0.1 | ✖
[lodash](https://www.npmjs.com/package/lodash) | ^3.10.0 | ✖
[babel-core](https://www.npmjs.com/package/babel-core) | 5.7.3 | ✔
[babelify](https://www.npmjs.com/package/babelify) | 6.1.2 | ✔
[eslint](https://www.npmjs.com/package/eslint) | 1.0.0-rc-1 | ✔
[node-readme](https://www.npmjs.com/package/node-readme) | 0.1.8 | ✔
[proxyquire](https://www.npmjs.com/package/proxyquire) | 1.6.0 | ✔
[tap-spec](https://www.npmjs.com/package/tap-spec) | 4.0.2 | ✔
[tape](https://www.npmjs.com/package/tape) | 4.0.0 | ✔


## Author

Julien Bouquillon <julien@bouquillon.com> http://github.com/revolunet

## License

 - **MIT** : http://opensource.org/licenses/MIT
