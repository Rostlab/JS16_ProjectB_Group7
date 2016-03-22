module.exports = (function() {
	// remember to call init before using the object
	// it requires the files 'prediction.json' and 'attribute_contribution.json' to be in the current folder
	var fs = require('fs');


	this.data_char = {};
	this.data_attr = {};


	this.init = function() {
		// read character predictions
		var json_char  = fs.readFileSync('./prediction.json','utf8');
		var array_char = JSON.parse(json_char);
		
		array_char.forEach( function(char) {
			this.data_char[char.name] = char;
		});

		// read attribute contributions
		var json_attr  = fs.readFileSync('./attribute_contribution.json','utf8');
		var array_attr = JSON.parse(json_attr);

		array_attr.forEach( function(attr) {
			this.data_attr[attr.name] = attr.ranking;
		});
	};


	this.getPlod = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return parseFloat(this.data_char[name].plod);
	};


	this.getAttrRank = function(attribute_name) {
		var name = attribute_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return parseFloat(this.data_attr[name]);
	};


	this.getAllCharPredictions = function() {
		return Object.keys(this.data_char).reduce(function(newObj,charName) {
			newObj[charName] = this.data_char[charName].plod;
			console.log(newObj);
			return newObj;
		},{});
	};

	this.getStatus = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return this.data_char[name].status;				
	}

	this.getPredStatus = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return this.data_char[name].pred_status;				
	}

	this.getAllAliveCharPredictions = function() {
		return Object.keys(this.data_char).reduce(function(newObj,charName) {
			if (this.data_char[charName].status == 'alive') {
				newObj[charName] = this.data_char[charName].plod;
			}
			return newObj;
		},{});
	}


	this.getAllAttrRanks = function() {
		return this.data_attr;
	};


	return this;
})();


