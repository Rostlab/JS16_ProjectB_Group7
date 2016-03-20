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
			this.data_char[char.name] = char.plod;
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
		return parseFloat(this.data_char[name]);
	};


	this.getAttrRank = function(attribute_name) {
		var name = attribute_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return parseFloat(this.data_attr[name]);
	};


	this.getAllCharPredictions = function() {
		return this.data_char;
	};


	this.getAllAttrRanks = function() {
		return this.data_attr;
	};


	return this;
})();


