# spreadsheet-to-json

![npm](https://img.shields.io/npm/v/spreadsheet-to-json.svg) ![license](https://img.shields.io/npm/l/spreadsheet-to-json.svg) ![github-issues](https://img.shields.io/github/issues/revolunet/spreadsheet-to-json.svg) ![Circle CI build status](https://circleci.com/gh/revolunet/spreadsheet-to-json.svg?style=svg)

![nodei.co](https://nodei.co/npm/spreadsheet-to-json.png?downloads=true&downloadRank=true&stars=true)

Convert Google Spreadsheets to JSON using Javascript

Uses [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) library to fetch data.

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

extractSheets({
    spreadsheetKey: 'abch54Ah75feBqKGiUjITgE9876Ypb0yE-abc',
    credentials: require('./google-generated-creds.json'),
    sheetsToExtract: ['Customers', 'Invoices']
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

 - **npm run start** : `babel-node ./index`
 - **npm run readme** : `node ./node_modules/.bin/node-readme`
 - **npm run test** : `./node_modules/babel-tape-runner/bin/babel-tape-runner spec/**/*.spec.js | ./node_modules/.bin/tap-spec`
 - **npm run build** : `babel -d ./dist ./src && npm run readme`
 - **npm run patch** : `npm run build && npm version patch && git push && npm publish`


## Dependencies

Package | Version | Dev
--- |:---:|:---:
[google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) | 1.0.1 | ✖
[lodash](https://www.npmjs.com/package/lodash) | 3.10.0 | ✖
[babel-tape-runner](https://www.npmjs.com/package/babel-tape-runner) | 1.1.0 | ✔
[babelify](https://www.npmjs.com/package/babelify) | 6.1.2 | ✔
[node-readme](https://www.npmjs.com/package/node-readme) | 0.1.7 | ✔
[tap-spec](https://www.npmjs.com/package/tap-spec) | 4.0.2 | ✔
[tape](https://www.npmjs.com/package/tape) | 4.0.0 | ✔


## Author

Julien Bouquillon <julien@bouquillon.com> http://github.com/revolunet

## License

 - **MIT** : http://opensource.org/licenses/MIT
