
//check we got a (potential) password
if(process.argv.length !== 3) {
	throw new Error('Incorrect number of arguments passed when starting - need a DB password');
}

//imports
const Database = require('./database.js');
const csv = require('fast-csv');
var https = require('https');
var fs = require('fs');

let insertCount = 0;

//this function handles actually reading the postcodes and putting them into the database
const worker = () => {
	console.log('start database operation');
	
	const arr = [];

	const doInsert = (index) => {

		fs.readFile('./data/'+arr[index], 'utf8', (err,data) => {
			if (err) {
				console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', err);
				return;
			}

			const obj = JSON.parse(data);
			
			console.log('starting: ' + obj.name);

			let firstRow = null;
			const calls = [];

			csv
			 .fromPath('./data/'+obj.file)
			 .on('data', function(data){
			 	
			 	if(firstRow === null) {
			 		firstRow = data;
			 	} else {
			 		
			 		if(firstRow.length != data.length) {
			 			console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BIG ERROR');
			 		} else {
			 			const dataObj = {}

			 			for(let z=0; z<firstRow.length; z++) {
			 				dataObj[firstRow[z]] = data[z];
			 			}

			 			const usePostcode = data[0].replace(' ', '').toUpperCase().trim();

			 			//add a function to the function array for later execution
			 			calls.push(new Promise((resolve, reject) => {
							Database.createConstituencyDocument(usePostcode, obj.name, dataObj).then(() => {
								resolve();
							}); 
						}));
			 		}
			 	}
		
			 })
			 .on('end', function(){
			     console.log('finished loading: ' + obj.name + ' - Executing....');

			   	Promise.all(calls).then(() => {
			   		insertCount++;
			   		console.log('done database insert, count at: ' + insertCount);

			   		if(index < arr.length-1) {
			   			doInsert(index+1);
			   		}
			   	});
			 });
		});

	};

	fs.readdir('./data/', function(err, items) {
	    for (var i=0; i<items.length; i++) {
	    	//grab only the meta data stuff
	       	if(items[i].endsWith('.meta-data')) {
	       		arr.push(items[i]);
	       	}
	    }

	    doInsert(0);
	});
}

//download from url function
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);

  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

//read in our list of postcode file locations, parse them and then download them all
fs.readFile('./data/uk-postcode-base.txt', 'utf8', (err,data) => {
	if (err) {
		console.log(err);
		return;
	}

 	const split = data.split('href="');

	const getByIndex = (index) => {

		const split2 = split[index].split('">');

	  	const url = 'https://www.doogal.co.uk/ElectoralConstituenciesCSV.ashx?constituency=' + split2[0].replace('ElectoralConstituencies.php?constituency=', '');

	  	const split3 = split2[1].split('</a>');
	  	
	  	const name = split3[0].trim();

	  	console.log('getting: ' + name, url);

	  	download(url, './data/'+index+'.data', (err) => {
	  		if(err) {
	  			console.log('ERROR!!!!', url);
	  		}

	  		const dataObj = {
	  			url,
	  			name,
	  			file: index+'.data'
	  		};

	  		fs.writeFile('./data/'+index+'.meta-data', JSON.stringify(dataObj), function(err) {
			    if(err) {
			        console.log('ERROR!!!!', url);
			    }
			}); 

	  		if(index < (split.length - 1)) {
	  			getByIndex(index+1);
	  		} else {
	  			//we are done, now inject into database
	  			//worker();
	  		}
	  	});
	};

	getByIndex(1);
});

