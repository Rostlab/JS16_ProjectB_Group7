const fs = require('graceful-fs');
const request = require('request');

if (!fs.existsSync('./Data')) {
	fs.mkdirSync('./Data');	
}



function loadEntities(entity) {
	process.stdout.write('https://got-api.bruck.me/api/' + entity);
	request('https://got-api.bruck.me/api/' + entity, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	  	process.stdout.write(body);
	  	var maiuscEntity = entity.substr(0,1).toUpperCase() + entity.substr(1 );
	  	//create directory if not exists
	  	if (!fs.existsSync('./Data/' + maiuscEntity)) {
			fs.mkdirSync('./Data/' + maiuscEntity);
			//fs.mkdirSync('./Data/' + maiuscEntity + '/info');
		}
	    arr = JSON.parse(body);
		for (charachter in arr) {
			var charFile = fs.createWriteStream('./Data/' + maiuscEntity + '/' + arr[charachter].name);
			charFile.end(JSON.stringify(arr[charachter]));
				  	process.stdout.write(arr[charachter].name);
	
		}
	  }
	})
}

// TODO create a command line interface to download all data from the database
loadEntities('characters');
//loadEntities('ages');
//loadEntities('continents');
//loadEntities('cultures');
//loadEntities('episodes');
//loadEntities('events');
//loadEntities('houseTypes');
//loadEntities('houses');
//loadEntities('regions');
//loadEntities('skills');