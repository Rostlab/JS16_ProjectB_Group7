const fDB = require('./filterDB.js');
const fs = require('fs');

var f = new fDB.filter();
var obj = {name:'emily'};

// create all filters in the library and require all to be satisfied

// charachters with at least one attribute between death and birth
f.and(fDB.dead_alive_filter());
// most popular charachters COMING SOON
f.and(fDB.popularity_filter());
// charachters that has the sum of the attributes rank (weka rank) at least 20
f.and(fDB.meaningful_attributes_filter(20));

// apply three filters and require at least 2 to be satisfied
f.or(fDB.dead_alive_filter());
f.or(fDB.popularity_filter());
f.or(fDB.meaningful_attributes_filter(20));
f.optionals(2);

// create a new filter based on attribute names, and require all to be present
f.and(fDB.attribute_filter(['attr1','attr2']));

// create a new filter based on attribute names, and require 1 to be present
f.and(fDB.attribute_filter(['attr1','attr2'],1));

// create a custum filter
f.and(new fDB.filter_component(function(current) {
	// current is a charachter contained in obj
	// params are defined in the next parameter
	// TODO: check if actually i can reference the params this way
	name = this.params.name;
	// returns true if the charachter satisfies the filter
	return true;
},{'name':''}));

// evaluate the filter to return the new object
var newObj = f.evaluate(obj);