/*
 * parseWekaOutput.js
 * 
 *   Copy your output from Weka to a file. This script should help you parsing it. 
 *   Use parseOutput_Classification() to write the characters' PLODs to a JSON file.
 *   Use parseOutput_AttrEval() to write the attribute contribution rankings to a JSON file.
 *
 */
var fs = require('fs');


parseOutput_Classification("./weka-output-classify.txt", "./prediction.json");
parseOutput_AttrEval("./weka-output-attreval.txt", "./attribute_contribution.json");



function parseOutput_AttrEval(wekafile_path, jsonoutput_path)
{
	console.log("reading Weka attribute evaluation from file... ");
	
	fs.readFile(wekafile_path, 'utf8', function (error, data) {
		if( !error ) {
			console.log("success.");
			
			var attributes = [];
			var lines = data.split("\n");
			
			// skip to ranking table
			while( lines[0] != "=== Attribute Selection on all input data ===" )
			{
				lines.shift();
			}
			
			// skip 12 lines
			for(var i=0; i<12; i++) {
				lines.shift();
			}
			
			// parse ranking table
			while( lines[0] !== "" )
			{
				var a = handleAttributeEvaluation(lines[0]);
				attributes.push(a);
				
				lines.shift();
			}
			
			console.log("writing JSON file... ");
			
			fs.writeFile(jsonoutput_path, JSON.stringify(attributes), function(err){
				if( !error ) {
					console.log("success.");
				} else {
					console.log("error.");
				}
			});
		} else {
			console.log("error.");
		}
	});
}



function parseOutput_Classification(wekafile_path, jsonoutput_path)
{
	console.log("reading Weka predictions from file... ");
	
	fs.readFile(wekafile_path, 'utf8', function (error, data) {
		if( !error ) {
			console.log("success.");
			
			var characters = [];
			var lines = data.split("\n");
			
			// skip to prediction table
			while( lines[0] != "=== Predictions on test data ===" )
			{
				lines.shift();
			}
			
			// skip 3 lines: description, empty line, column names
			lines.shift();
			lines.shift();
			lines.shift();
			
			// parse prediction table
			while( lines[0] !== "" )
			{
				var c = handleCharacterPrediction(lines[0]);
				characters.push(c);
				
				lines.shift();
			}
			
			console.log("writing JSON file... ");
			
			fs.writeFile(jsonoutput_path, JSON.stringify(characters), function(err){
				if( !error ) {
					console.log("success.");
				} else {
					console.log("error.");
				}
			});
		} else {
			console.log("error.");
		}
	});
}




function handleCharacterPrediction(line)
{
	var columns = line.split(/[(+)\s]+/);
	var character = {};
	
	character.status      = parseStatus( columns[2] );
	character.status_pred = parseStatus( columns[3] );
	character.pred_err    = parseFloat(  columns[4].replace('*', '') );
	character.pred_prob   = parseFloat(  columns[5].replace('*', '') );
	character.name        = columns.slice(6, -1).join(" ").replace(/[()\']/g, '');
	
	// only store PLOD of alive characters
	if( character.status == 'alive' ) {
	
		if( character.status_pred == 'dead' ) {
			character.plod = character.pred_prob;
		}
		else if( character.status_pred == 'alive' ) {
			character.plod = 1.0 - character.pred_prob;
		}
	} else {
		// already dead
		//character.plod = 0/NaN/undefined?;
	}
	
	return character;
}



function handleAttributeEvaluation(line)
{
	var columns = line.split(/\s+/);
	var attribute = {};
	
	attribute.ranking = parseFloat( columns[1] );
	attribute.name    = columns.slice(3).join(" ").replace(/[()\']/g, '');
	
	return attribute;
}



function parseStatus(inputStr)
{
	if( inputStr.indexOf('alive') > -1 ) {
		return 'alive';
	}
	else if( inputStr.indexOf('dead') > -1 ) {
		return 'dead';
	}
	else {
		return undefined;
	}
}



