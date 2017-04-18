module.exports = (function() {
	// remember to call init before using the object
	// it requires the files 'prediction.json' and 'attribute_contribution.json' to be in the current folder
	var fs = require('fs');
	var path = require('path');


	this.data_char  = {};
	this.data_attr  = {};
	this.top_actual = [];
	this.top_pred   = [];


	this.init = function() {
		// read character predictions
		var json_char  = fs.readFileSync(path.resolve(__dirname,'./prediction.json'),'utf8');
		var array_char = JSON.parse(json_char);
		
		array_char.forEach( function(char) {
			this.data_char[char.name] = char;
		});

		array_char.sort( function(a, b) {
			var val_a = -1, val_b = -1;
			if( typeof a.plod == "number" ) { val_a = a.plod; }
			if( typeof b.plod == "number" ) { val_b = b.plod; }
			return (val_b - val_a);
		});
		for(var i=0; i<array_char.length; i++) {
			if( typeof array_char[i].plod != "number" ) {
				break;	// character does not exist, is already dead or is not predicted to die.
			}
			this.top_pred.push( [array_char[i].name, array_char[i].plod] );
		}

		// read attribute contributions
		var json_attr  = fs.readFileSync(path.resolve(__dirname,'./attribute_contribution.json'),'utf8');
		var array_attr = JSON.parse(json_attr);

		array_attr.forEach( function(attr) {
			this.data_attr[attr.name] = attr.ranking;
		});

		// read hand-picked top list of characters most likely to die
		var json_top  = fs.readFileSync(path.resolve(__dirname,'./top.json'),'utf8');
		var array_top = JSON.parse(json_top);

		array_top.sort( function(a, b) {
			var val_a = -1, val_b = -1;
			if( typeof a.plod == "number" ) { val_a = a.plod; }
			if( typeof b.plod == "number" ) { val_b = b.plod; }
			return (val_b - val_a);
		});
		for(i=0; i<array_top.length; i++) {
			this.top_actual.push( [array_top[i].name, array_top[i].plod] );
		}
	};


	this.getPlod = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return parseFloat(this.data_char[name].plod);
	};


	this.getTop = function(num_top) {
		num_top = num_top || 10;
		var max = (num_top < this.top_actual.length) ? (num_top) : (this.top_actual.length);
		return top_actual.slice(0, max);
	};


	this.getTopPredicted = function(num_top) {
		num_top = num_top || 10;
		var max = (num_top < this.top_pred.length) ? (num_top) : (this.top_pred.length);
		return top_pred.slice(0, max);
	};


	this.getAttrRank = function(attribute_name) {
		var name = attribute_name.toString();
		return this.data_attr[name];
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
	};

	this.getPredStatus = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return this.data_char[name].pred_status;				
	};

	this.getAllAliveCharPredictions = function() {
		return Object.keys(this.data_char).reduce(function(newObj,charName) {
			if (this.data_char[charName].status == 'alive') {
				newObj[charName] = this.data_char[charName].plod;
			}
			return newObj;
		},{});
	};


	this.getAllAttrRanks = function() {
		return this.data_attr;
	};


	return this;
})();


