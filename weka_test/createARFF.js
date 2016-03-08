
const fs = require('fs');
const request = require('request');

//ARFF_from_file();
ARFF_from_database();



function ARFF_from_file()
{
	console.log("reading characters from file... ")
	var char_data = fs.readFileSync("./characters.json");
	console.log("done.")
	
	createARFF('./test.arff', char_data.toString());
}



function ARFF_from_database()
{
	console.log("requesting characters from database... ")
	
	request('https://got-api.bruck.me/api/characters', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("success.")
			createARFF('./test.arff', body);
		} else {
			console.log("error.")
		}
	});
}



function createARFF(outfilepath, char_data)
{
	console.log("creating ARFF file...")

	// parse character data
	var json_input    = JSON.parse(char_data);
	var list_cultures = getAttrValList(json_input, 'culture');
	var list_houses   = getAttrValList(json_input, 'allegience');
	var list_titles   = getAttrValList(json_input, 'title');

	// write ARFF header
	var arff_output = fs.createWriteStream(outfilepath);
	arff_output.write('% ARFF file\n% JST - Project B - Group 7\n% v3\n%\n');
	arff_output.write('@relation \'got_plod\'\n');
	
	// write attribute definitions
	arff_output.write('@attribute name string\n');
	arff_output.write('@attribute dateOfBirth numeric\n');
	arff_output.write('@attribute dateOfDeath numeric\n');
	arff_output.write('@attribute culture {'    + getListStr(list_cultures) + '}\n');
	arff_output.write('@attribute allegiance {' + getListStr(list_houses)   + '}\n');
	arff_output.write('@attribute title {'      + getListStr(list_titles)   + '}\n');
	arff_output.write('@attribute status {alive,dead}\n');
	
	// write character data
	arff_output.write('@data\n');
	
	json_input.forEach( function(character){
		var line = "";
		
		line += parseStr( character["name"]) + ",";
		line += parseNum( character["dateOfBirth"]) + ",";
		line += parseNum( character["dateOfDeath"]) + ",";
		line += parseEnum( character["culture"], list_cultures) + ",";
		line += parseEnum( character["allegiance"], list_houses) + ",";
		line += parseEnum( character["title"], list_titles) + ",";
		line += parseStat( character["dateOfDeath"]) + "\n";
		
		arff_output.write(line);
	});
	
	// close
	arff_output.end('%\n%');
	console.log("finished.");
}



function readList(filepath)
{
	var alist = fs.readFileSync(filepath).toString().split("\n");
	
	for(var i=0; i<alist.length; i++) {
		alist[i] = fixStr(alist[i]);
	}
	return alist;
}



function getAttrValList(json_input, attr_name)
{
	var valList = [];
	
	json_input.forEach( function(character){
		var val = character[attr_name];
		
		if( val != undefined ) {
			var strVal = fixStr( String(val) );
			
			if( valList.indexOf(strVal) == -1 ) {
				valList.push(strVal);
			}
		}
	});
	return valList;
}



function getListStr(enum_list)
{
	return "\'" + enum_list.join("\', \'") + "\'";
}



function parseStr(json_element)
{
	if(json_element !== undefined) {
		return "\'" + fixStr(json_element) + "\'";
	}
	return '?';
}



function parseNum(json_element)
{
	if(json_element !== undefined) {
		return parseInt(json_element);
	}
	return '?';
}



function parseEnum(json_element, enum_list)
{
	if(json_element !== undefined) {
		strEnum = fixStr(json_element);

		for(var i=0; i<enum_list.length; i++) {
			
			if( strEnum.indexOf(enum_list[i]) > -1 ) {
				return '\'' + enum_list[i] + '\'';
			}
		}
	}
	return '?';
}



function parseStat(json_element)
{
	if(json_element == undefined) {
		return 'alive';
	} else {
		return 'dead';
	}
}



function fixStr(strInput)
{
	return strInput.toLowerCase().replace("\'", "").replace("\n", " ");
}

