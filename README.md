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
      "id": "F0002",
      "totalAmount": "4398.2"
    }
  ]
}
```

This can be useful when you want people edit spreadsheets and need to work with the data.

## Install

`npm i --save spreadsheet-to-json`

## QuickStart

`extractSheets` can use node callback pattern or async/await.

```js
const { extractSheets } = require("spreadsheet-to-json");

// optional custom format cell function
const formatCell = (sheetTitle, columnTitle, value) => value.toUpperCase();

extractSheets(
  {
    // your google spreadhsheet key
    spreadsheetKey: "abch54Ah75feBqKGiUjITgE9876Ypb0yE-abc",
    // your google oauth2 credentials or API_KEY
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

The `credentials` key can either be a API_KEY `string` or a service account `object`.

### API Key

You can create an API key here : https://console.developers.google.com/apis/credentials

Be sure to restrict it to Google Drive API

### Google service account

Create a credentials.json file for your app here : https://console.developers.google.com/

- create a new project
- enable the Drive API
- in **credentials**, select **create new credentials** then **service account** and save the generated JSON. (privately)
- then give the JSON contents to the `credentials` parameter in the `extractSheets` call.

Share the target google spreadsheet with the `client_email` from the credentials.json.

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


total:     21
passing:   21
duration:  1.9s
```

## Author

Julien Bouquillon <julien@bouquillon.com> http://github.com/revolunet

## License

- **MIT** : http://opensource.org/licenses/MIT
