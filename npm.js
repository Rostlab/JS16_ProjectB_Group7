module.exports = (function() {
	// remember to call init before using the object
	// it requires the files 'prediction.json' and 'attribute_contribution.json' to be in the current folder
	var fs = require('fs');


	this.data_char  = {};
	this.data_attr  = {};
	this.top_actual = [];
	this.top_pred   = [];


	this.init = function() {
		// read character predictions
		var json_char  = fs.readFileSync('./prediction.json','utf8');
		var array_char = JSON.parse(json_char);
		
		array_char.forEach( function(char) {
			this.data_char[char.name] = char.pred_prob;
		});

		array_char.sort( function(a, b) {
			var val_a = -1, val_b = -1;
			if( typeof a.pred_prob == "number" ) { val_a = a.pred_prob; }
			if( typeof b.pred_prob == "number" ) { val_b = b.pred_prob; }
			return (val_b - val_a);
		});
		for(var i=0; i<array_char.length; i++) {
			if( typeof array_char[i].pred_prob != "number" ) {
				break;	// character does not exist, is already dead or is not predicted to die.
			}
			this.top_pred.push( [array_char[i].name, array_char[i].pred_prob] );
		}

		// read attribute contributions
		var json_attr  = fs.readFileSync('./attribute_contribution.json','utf8');
		var array_attr = JSON.parse(json_attr);

		array_attr.forEach( function(attr) {
			this.data_attr[attr.name] = attr.ranking;
		});

		// read hand-picked top list of characters most likely to die
		var json_top  = fs.readFileSync('./top.json','utf8');
		var array_top = JSON.parse(json_top);

		array_top.sort( function(a, b) {
			var val_a = -1, val_b = -1;
			if( typeof a.pred_prob == "number" ) { val_a = a.pred_prob; }
			if( typeof b.pred_prob == "number" ) { val_b = b.pred_prob; }
			return (val_b - val_a);
		});
		for(i=0; i<array_top.length; i++) {
			this.top_actual.push( [array_top[i].name, array_top[i].pred_prob] );
		}
	};


	this.getPlod = function(character_name) {
		var name = character_name.toString().toLowerCase().replace(/[\'()]/g, '');
		return this.data_char[name];
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
		return this.data_char;
	};


	this.getAllAttrRanks = function() {
		return this.data_attr;
	};


	return this;
})();


