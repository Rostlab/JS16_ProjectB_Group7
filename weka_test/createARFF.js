var fDB = require('./filterDB.js');
var fs = require('fs');
var request = require('request');

// Current GoT year
//   Request for an API call to confirm that - Took from GoT wiki 
//   Reference: http://awoiaf.westeros.org/index.php/Years_after_Aegon%27s_Conquest#Year_300_After_the_Conquest
var currentYear = 300;

// Maximum age
//   Maximum age of a character. Used to mark characters, who don't have a 'dateOfDeath', as 'dead'.
var maxAge = 100;
var ageGroups = [10,30,60,maxAge];


//ARFF_from_file();
ARFF_from_database();



function ARFF_from_file()
{
	console.log("reading characters from file... ");
	
	fs.readFile("./characters.json", 'utf8', function (error, character_data) {
		if( !error ) {
			console.log("success.");
			var json_input = JSON.parse(character_data.toString());
			
    		createARFF('./test.arff', json_input);
    		
		} else {
			console.log("error.");
		}
	});
}



function ARFF_from_database()
{
	console.log("requesting characters from database... ");
	
	request('https://got-api.bruck.me/api/characters', function (error, response, character_data) {
		if (!error && response.statusCode == 200) {
			console.log("success.");
			
			console.log("requesting houses from database... ");
			
			request('https://got-api.bruck.me/api/houses', function (error, response, house_data) {
				if (!error && response.statusCode == 200) {
					console.log("success.");
					
					var json_char  = JSON.parse(character_data);
					var json_house = JSON.parse(house_data);
					
					json_house = getNumHousesOverlord(json_house);
					json_char  = addCharacterAttributes(json_char, json_house);
					json_char = computeAttributes(json_char);
					
					var f = new fDB.filter();
					f.and(fDB.popularity_filter(0,1000));
					json_char = f.evaluate(json_char);
					
					createARFF('./test.arff', json_char);
					
				} else {
					console.log("error.");
				}
			});
		} else {
			console.log("error.");
		}
	});
}

// compute the remaining attributes (for the attribute filter to work)
function computeAttributes(obj) {
	obj.forEach(function(character) {
		character.age = calcAge(character);
		character.ageGroup = calcAgeGroup(character);
		character.gender = calcGender(character);
	});
	return obj;
}



// for each house: adds the number of houses of the overlord
function getNumHousesOverlord(json_house)
{
	// TODO: count overlord's houses (still missing in database)
	return json_house;
}



// for each character: add attributes from other collections
function addCharacterAttributes(json_char, json_house)
{
	json_char.forEach( function(character){
		
		if( character.house !== undefined ) {
			house = getElementByValue(json_house, 'name', character.house);
			
			if( house !== undefined ) {		// only if database incomplete
				
				character.house_founded = house.founded;
				character.num_houses_overlord = house.num_houses_overlord;
			}
		}
	});
	return json_char;
}



// from array of json-records: get record where key_name==value
function getElementByValue(json_input, key_name, value)
{
	for(var i in json_input) {
		if( json_input[i][key_name] == value ) {
			return json_input[i];
		}
	}
	return undefined;
}



function createARFF(outfilepath, json_input)
{
	console.log("creating ARFF file...");

	// write ARFF header
	var arff_output = fs.createWriteStream(outfilepath);
	arff_output.write('% ARFF file\n% JST - Project B - Group 7\n%\n');
	arff_output.write('@relation \'got_plod\'\n');
	
	// write attribute definitions
	arff_output.write('@attribute name string\n');
	arff_output.write('@attribute dateOfBirth numeric\n');
	arff_output.write('@attribute dateOfDeath numeric\n');
	
	arff_output.write('@attribute culture {' + getListStr(json_input, 'culture') + '}\n');
	arff_output.write('@attribute house {'   + getListStr(json_input, 'house')   + '}\n');
	arff_output.write('@attribute title {'   + getListStr(json_input, 'title')   + '}\n');
	arff_output.write('@attribute father {'  + getListStr(json_input, 'father')  + '}\n');
	arff_output.write('@attribute mother {'  + getListStr(json_input, 'mother')  + '}\n');
	arff_output.write('@attribute heir {'    + getListStr(json_input, 'heir')    + '}\n');
	
	arff_output.write('@attribute house_founded numeric\n');
	arff_output.write('@attribute num_houses_overlord numeric\n');
	arff_output.write('@attribute age numeric\n');
    arff_output.write('@attribute ageGroup {' + getAgeGroupString(ageGroups) + '}\n');
	arff_output.write("@attribute gender {'male', 'female'}\n");

	arff_output.write("@attribute status {'alive','dead'}\n");


	// write character data
	arff_output.write('@data\n');
	
	json_input.forEach( function(character){
		var line = "";
		
		line += parseStr( character.name ) + ",";
		line += parseNum( character.dateOfBirth ) + ",";
		line += parseNum( character.dateOfDeath ) + ",";
		
		line += parseStr( character.culture ) + ",";
		line += parseStr( character.house ) + ",";
		line += parseStr( character.title ) + ",";
		line += parseStr( character.father ) + ",";
		line += parseStr( character.mother ) + ",";
		line += parseStr( character.heir ) + ",";
		// father and mother are useless features since most characters have different parents.
        // We need generic features that can be applied to all characters and have meaning to most
        // Feature request married / notMarried (doesnt matter to whom)
        
		line += parseNum( character.house_founded ) + ",";
		line += parseNum( character.num_houses_overlord ) + ",";
		line += character.age + ",";
        line += character.ageGroup + ",";
		line += character.gender + ",";
		
		line += calcStatus(character) + "\n";
		
		arff_output.write(line);
	});
	
	// close
	arff_output.end('%\n%');
	console.log("finished.");
}



function getListStr(json_input, attr_name)
{
	var valList = [];
	
	json_input.forEach( function(character){
		var val = character[attr_name];
		
		if( val !== undefined ) {
			var strVal = fixStr( String(val) );
			
			if( valList.indexOf(strVal) == -1 ) {
				valList.push(strVal);
			}
		}
	});
	
	return "\'" + valList.join("\', \'") + "\'";
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



function calcStatus(character)
{
    if (typeof character.dateOfDeath !== 'undefined') {
        return '\'dead\'';		// character is dead
    }
    if (typeof character.dateOfBirth !== 'undefined'  &&  (currentYear - character.dateOfBirth) > maxAge) {
        return '\'dead\'';		// character is probably dead, but 'dateOfDeath' is missing
    }
    return '\'alive\'';
}



function fixStr(strInput)
{
	return strInput.toLowerCase().replace("\'", "").replace("\n", " ");
}



// Add support for character age
function calcAge(character)
{
	if(typeof character.dateOfBirth !== 'undefined') {
    
    	if(typeof character.dateOfDeath !== 'undefined'){
        	return character.dateOfDeath - character.dateOfBirth;	// dead: calculate age of death
        } else {
        	var age = currentYear - character.dateOfBirth;			// alive: calculate current age
        	
        	if( age > maxAge ) {
        		return '?';											// probably dead
        	} else {
        		return age;
        	}
        }
	}
	return '?';
}



function getAgeGroupString(array){
    return "\'" + array.join("\', \'") + "\'";
}



function calcAgeGroup(character){
    var age = calcAge(character);
        
    if( age !== '?'){
        for(var i=0; i<ageGroups.length; i++){
            if(age <= ageGroups[i] ){
                return "\'" + ageGroups[i] + "\'";
            }
        }
    }
    return '?';
}



function calcGender(character)
{
	if( character.male === true ) {
		return '\'male\'';
	}
	else if( character.male === false ) {
		return '\'female\'';
	}
	else {
		// suggestion: try to find out the gender using the title or name.
		return '?';
	}
}




