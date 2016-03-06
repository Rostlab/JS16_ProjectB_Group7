const fs = require('fs');
const request = require('request');

ARFF_from_file();
//ARFF_from_database();



function ARFF_from_file()
{
	var char_data = fs.readFileSync("./characters.json");
	
	createARFF('./test.arff', char_data.toString());
}



function ARFF_from_database()
{
	var char_data;
	
	request('https://got-api.bruck.me/api/characters', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			char_data = body;
			parseDate = parseDateDatabase;
			fixAttr = fixAttrDatabase;
			createARFF('./test.arff', char_data);
		}
	});
}



function createARFF(outfilepath, char_data)
{
	console.log("creating ARFF file...")
	
	var list_cultures = readList('./list_cultures.txt');
	var list_houses   = readList('./list_houses.txt');
	var list_titles   = readList('./list_titles.txt');
	
	// write ARFF header
	var arff_output = fs.createWriteStream(outfilepath);
	arff_output.write('% ARFF file\n% JST - Project B - Group 7\n% v2\n%\n');
	arff_output.write('@relation \'got_plod\'\n');
	
	// write attribute definitions
	arff_output.write('@attribute name string\n');
	arff_output.write('@attribute birth_date numeric\n');
	arff_output.write('@attribute death_date numeric\n');
	arff_output.write('@attribute culture {'    + getListStr(list_cultures) + '}\n');
	arff_output.write('@attribute allegiance {' + getListStr(list_houses)   + '}\n');
	arff_output.write('@attribute title {'      + getListStr(list_titles)   + '}\n');
	//arff_output.write('@attribute spouse string\n');
	arff_output.write('@attribute status {alive,dead}\n');
	
	// write character data
	arff_output.write('@data\n');
	
	var json_input = JSON.parse( fixAttr(char_data) );
	
	json_input.forEach( function(character){
		var line = "";
		
		line += "\'" + character["Name"] + "\',";
		line += parseDate( character["Born"]) + ",";
		line += parseDate( character["Died"]) + ",";
		line += parseEnum( character["Culture"], list_cultures) + ",";
		line += parseEnum( character["Allegiance"], list_houses) + ",";
		line += parseEnum( character["Title"], list_titles) + ",";
		line += parseStat( character["Died"]) + "\n";
		
		arff_output.write(line);
	})
	
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



function getListStr(enum_list)
{
	return "\'" + enum_list.join("\', \'") + "\'";
}



function parseDate(json_element)
{
	if(json_element !== undefined) {
		var strDate = fixStr(json_element);
		
		var pos_num = strDate.search(/\d/);
		var pos_ac  = strDate.indexOf(" ac");
		var pos_bc  = strDate.indexOf(" bc");
		
		if( pos_num > -1 ) {
			
			if( pos_ac > -1 ) {
				return parseInt( strDate.slice(pos_num, pos_ac) );
			}
			else if ( pos_bc > -1 ) {
				return - parseInt( strDate.slice(pos_num, pos_bc) );
			}
		}
	}
	return '?';
}

function parseDateDatabase(json_element) {
	if(json_element !== undefined) {
		return parseInt(json_element);
	}
}



function parseStat(json_element)
{
	if(json_element == undefined) {
		return 'alive';
	} else {
		return 'dead';
	}
}


//TODO: does not work for me, because each entry of enum_list terminates wit a '\r'. hope is a windows problem 
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



// fix duplicate identifiers of attributes 'Born' and 'Died'
function fixAttr(char_data)
{
	return char_data.replace("\"Born in\"", "\"Born\"").replace("\"Died in\"", "\"Died\"");
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function fixAttrDatabase(char_data)
{
	return char_data.replace("\"dateOfBirth\"", "\"Born\"").replace("\"dateOfDeath\"", "\"Died\"").replaceAll("name", "Name").replaceAll("title", "Title");
}



function fixStr(strInput)
{
	return strInput.toLowerCase().replace("\'", "").replace("\n", " ");
}




