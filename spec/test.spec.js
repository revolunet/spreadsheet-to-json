'use strict';

var proxyquire =  require('proxyquire'),
	test = require('tape');

// python-like xrange
function* range (begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}

let mockData = {
	Customers: [{
		id: 1,
		name: 'Johnny',
		location: 'Texas',
		private: true
	},{
		id: 2,
		name: 'Tanguy',
		location: 'Bangkok',
		private: true
	},{
		id: 3,
		name: 'Céline',
		location: 'Paris',
		private: true
	},{
		id: 4,
		name: 'Camille',
		location: 'Marseille',
		private: true
	},{
		id: 5,
		name: 'Raphaël',
		location: 'Cau',
		private: true
	}]
};

mockData.Invoices = [for (i of range(1, 10)) i].map(id => {
	return {
		id,
		amount: ''+parseInt(Math.random()*50000,10),
		ref: `F2015-${id}`
	};
})

mockData.Leads = [for (i of range(1, 10)) i].map(id => {
	return {
		id,
		estimate: ''+parseInt(Math.random()*50000,10),
		ref: `L2015-${id}`
	};
})

mockData.Private = [{id:42, secret: 'stuff'}];


var worksheetMock = tableName => {
	return {
		title: tableName,
		rowCount: mockData[tableName].length,
		colCount:  Object.keys(mockData[tableName][0]).length,
		getCells: (options, cb) => {
			// the column titles
			var fields = exportedFields[tableName].length?exportedFields[tableName]: Object.keys(mockData[tableName][0]);
			let cells = fields.map(key => { return {value: key}; });
			cb(null, cells);
		},
		getRows: function(options, cb) {
			// cells datas
			cb(null, mockData[tableName]);
		}
	}
}

const exportedFields = {
	Customers: ['id', 'name', 'location'],
	Invoices: ['ref', 'amount'],
	Leads: [],
	Private: ['id']
};

const sheetMock = {
	worksheets: [
		worksheetMock('Customers'),
		worksheetMock('Invoices'),
		worksheetMock('Leads'),
		worksheetMock('Private')
	]
}

var converter = proxyquire('../src', {
	'google-spreadsheet': function() {
		return {
			useServiceAccountAuth: function(err, cb) {
				cb();
			},
			getInfo: function(cb) {
				cb(null, sheetMock);
			}
		};
	}
});

//extractSheet({worksheet, formatCell}, cb)


test("extractSheet should produce correct data", (t) => {

	converter.extractSheet({
		worksheet: worksheetMock('Customers')
	}, function(data) {
		t.equal(data.length, mockData.Customers.length, `sheet should have ${mockData.Customers.length} rows`);
		t.equal(Object.keys(data[0]).length, exportedFields.Customers.length, `row should have ${exportedFields.Customers.length} properties`);
		t.deepEqual(Object.keys(data[0]), exportedFields.Customers, `row should have correct properties`);
		t.equal(data[0].name, mockData.Customers[0].name, `name should be ${mockData.Customers[0].name}`);
		t.equal(data[0].id, mockData.Customers[0].id, `id should be ${mockData.Customers[0].id}`);
		t.end();
	});

});

test("formatCell", (t) => {
	let formatCell = function(value, sheetName, colName) {
		if (colName==='id') {
			return value;
		}
		return (''+value).toUpperCase();
	};
	converter.extractSheet({
		worksheet: worksheetMock('Customers'),
		formatCell
	}, function(data) {
		t.notEqual(data[0].name, mockData.Customers[0].name, `names should not be equal`);
		t.equal(data[0].name, mockData.Customers[0].name.toUpperCase(), `name should be uppercased`);
		t.equal(data[0].id, mockData.Customers[0].id, `id should be ${mockData.Customers[0].id}`);
		t.end();
	});

});

test("extractSheets should produce correct data", (t) => {
	let sheetsToExtract = ['Customers', 'Invoices', 'Leads']
	converter.extractSheets({
		spreadsheetKey: 'xxx',
		sheetsToExtract
	}, function(data) {
		t.equal(Object.keys(data).length, sheetsToExtract.length, `data should have ${sheetsToExtract.length} sheets`);
		t.deepEqual(Object.keys(data), sheetsToExtract, `sheets should have correct names`);
		t.equal(data.Private, undefined, `Private sheet should not be exported`);

		sheetsToExtract.map(sheetName => {
			t.deepEqual(data[sheetName].length, mockData[sheetName].length, `${sheetName} should have ${mockData[sheetName].length} rows`);

			var expectedFields = exportedFields[sheetName].length?exportedFields[sheetName]:Object.keys(mockData[sheetName][0]);
			t.deepEqual(Object.keys(data[sheetName][0]), expectedFields, `${sheetName} properties names should equal ${expectedFields}`);
		})

		t.end();
	});

});
