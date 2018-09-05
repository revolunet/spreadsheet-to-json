# spreadsheet-to-json

![npm](https://img.shields.io/npm/v/spreadsheet-to-json.svg) ![license](https://img.shields.io/npm/l/spreadsheet-to-json.svg) ![github-issues](https://img.shields.io/github/issues/revolunet/spreadsheet-to-json.svg) [![Circle CI build status](https://circleci.com/gh/revolunet/spreadsheet-to-json.svg?style=svg)](https://circleci.com/gh/revolunet/spreadsheet-to-json)

![nodei.co](https://nodei.co/npm/spreadsheet-to-json.png?downloads=true&downloadRank=true&stars=true)

Convert Google Spreadsheets to JSON using Javascript

Uses the [google-spreadsheet](https://www.npmjs.com/package/google-spreadsheet) library to fetch data.

The final JSON is based on sheets names and column titles and finally looks like this :

```json
{
  "Customers": [
    {
      "name": "Sony",
      "country": "Japan"
    },
    {
      "name": "Renault",
      "country": "France"
    }
  ],
  "Invoices": [
    {
      "id": "F0001",
      "totalAmount": "12367.12"
    },
    {
      "name": "F0002",
      "totalAmount": "4398.2"
    }
  ]
}
```

This can be useful when you want people edit spreadsheets and need to work with the data.

## Install

`npm i --save spreadsheet-to-json`

## QuickStart

```js
const { extractSheets } = require("spreadsheet-to-json");

// optional custom format cell function
const formatCell = (sheetTitle, columnTitle, value) => value.toUpperCase();

extractSheets(
  {
    // your google spreadhsheet key
    spreadsheetKey: "abch54Ah75feBqKGiUjITgE9876Ypb0yE-abc",
    // your google oauth2 credentials (optional for world-readable spreadsheets)
    credentials: require("./google-generated-creds.json"),
    // optional: names of the sheets you want to extract
    sheetsToExtract: ["Customers", "Invoices"],
    // optional: custom function to parse the cells
    formatCell: formatCell
  },
  function(err, data) {
    console.log("Customers: ", data.Customers);
    console.log("Invoices: ", data.Invoices);
  }
);
```

see [./example.js](./example.js)

## Authentification

Create a credentials.json file for your app here : https://console.developers.google.com/

- create a new project
- enable the Drive API
- in **credentials**, select **create new credentials** then **service account** and save the generated JSON. (privately)
- then give the JSON contents to the `credentials` parameter in the `extractSheets` call.

Share the target google spreadsheet with the `client_email` from the credentials.json.


## Specials Flags
You also can use two flags: toArray and toColumn.
The following exemples use this worksheet: https://docs.google.com/spreadsheets/d/1RbwBQOJRYNefRtAtux3O-gyV8JDrHL9BwXCoBPPQMjA/edit#gid=0 :


### FLAG "toArray"
This flag allow to concatenate data of the columns with the same title
```js
const { extractSheets } = require("spreadsheet-to-json");

extractSheets({
    // your google spreadhsheet key
    spreadsheetKey: "1RbwBQOJRYNefRtAtux3O-gyV8JDrHL9BwXCoBPPQMjA",
    // your google oauth2 credentials
    credentials: null,
    // names of the sheet you want to extract (or [] for all)
    sheetsToExtract: [],
    // In an array, you list the name of the column you want to concatenate
    toArray: ["wrong"]
}, function(err, data) {
    console.log(data);
    // will output 
    //  { 'Feuille 1': 
    //   [
    //    {
    //      question: 'The sky is ?', 
    //      good: 'blue',
    //      wrong: ['red', 'pink', 'green'] },
    //    { 
    //      question: 'Water freeze at ?',
    //      good: '0',
    //      wrong: ['4', '90', '-23']
    //    } 
    //   ]
    //  }

});

```

### FLAG "toColumn"
This flag allow to create new object for columns with same name (by default the first column is on output and others are ignored)
```js
const { extractSheets } = require("spreadsheet-to-json");

extractSheets({
    // your google spreadhsheet key
    spreadsheetKey: "1RbwBQOJRYNefRtAtux3O-gyV8JDrHL9BwXCoBPPQMjA",
    credentials: null,
    // names of the sheet you want to extract (or [] for all)
    sheetsToExtract: [],
    // Flag to return same columns in an array
    toArray: ["wrong"]
}, function(err, data) {
    console.log(data);
    // will output 
    //  { 'Feuille 1': 
    //       [ { question: 'The sky is ?',
    //           good: 'blue',
    //           wrong: 'red',
    //           wrong_2: 'pink',
    //           wrong_3: 'green' },
    //         { question: 'Water freeze at ?',
    //           good: '0',
    //           wrong: '4',
    //           wrong_2: '90',
    //           wrong_3: '-23' } ] }


});

```

IMPORTANT: If you use toArray and toColumn flags on the same name, toArray will be used.

## Tests

```
extractSheet should produce correct data

✓ sheet should have 5 rows
✓ row should have 4 properties
✓ row should have correct properties
✓ name should be Johnny
✓ id should be 1

formatCell

✓ names should not be equal
✓ name should be uppercased
✓ id should be 1

extractSheets should produce correct data

✓ data should have 3 sheets
✓ sheets should have correct names
✓ Private sheet should not be exported
✓ Customers should have 5 rows
✓ Customers properties names should equal id,name,location,Exotic_ Col-NAME
✓ Invoices should have 9 rows
✓ Invoices properties names should equal ref,amount
✓ Leads should have 9 rows
✓ Leads properties names should equal id,estimate,ref

open invalid spreadsheet should return empty data

✓ invalid should have no rows

columns with exotic names should be handled correctly

✓ Exotic column name should exist in output
✓ Exotic column name should be renamed in data
✓ Exotic column name should be handled correctly

toArray (option)

✔ Sheet should contain 2 objects
✔ Sheet properties names should equal question,good,wrong
✔ Wrong element should exist in output as an array
✔ First object should contain a wrong array with three elements

toColumn (option)

✔ Sheet should contain 2 objects
✔ Sheet properties names should equal question,good,wrong,wrong_2,wrong_3
✔ Wrong element should not be an array
✔ Wrong object in first object should contain red



total:     27
passing:   27
duration:  3s
```

## Author

Julien Bouquillon <julien@bouquillon.com> http://github.com/revolunet

## License

- **MIT** : http://opensource.org/licenses/MIT
