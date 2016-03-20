var fs = require('fs');
var popularity = require('./popularity');
module.exports = {
	// filter data structure
	// evaluation is at very end, run evaluate for the object
	filter : function() {
		this.required_filters = [];
		this.optional_filters = [];
		this.num_true_optional_filters = 0;
		this.evaluate = function(object) {
			return filterEach(object,this.required_filters,this.optional_filters,this.num_true_optional_filters);
		};
		this.and = function(filter_component) {
			this.required_filters.push(filter_component);
		};
		this.or = function(filter_component) {
			this.optional_filters.push(filter_component);
		};
		this.optionals = function(n) {
			if (n <= this.optional_filters.length) {
				this.num_true_optional_filters = n;
			}
		};
	},

	// component of a filter: a function and some parameters
	filter_component : function(fun,params) {
		this.fun = fun;
		this.params = params;
		this.evaluate = function(object) {
			// creates a filter object on the fly and evaluates it
			var f = new module.exports.filter();
			f.and(this);
			return f.evaluate(object);
		};
	},

	// returns a new filter that asks for the attributes to be present
	//the parameter num_names is optional
	attribute_filter : function(attribute_list,num_names) {
		return new module.exports.filter_component(filterByName,{'name_list':attribute_list,'num_names':num_names});
	},

	// returns a filter for wich we know the date of birth or the date of death
	dead_alive_filter : function() {
		return module.exports.attribute_filter(['dateOfBirth','dateOfDeath'],1);
	},

	// TODO: read popularity of character
	popularity_filter : function(percentage) {
		component = new module.exports.filter_component(filterByPopularity,{popularityByName:{},min_popularity:percentage});
		component.init = initFilterByPopularity;
		return component;
	},

	// read attributes from weka and see if the rank reaches the percentage
	meaningful_attributes_filter : function (percentage) {
		if (percentage === undefined) {
			percentage = 20;
		}
		var json_attributes_values = fs.readFileSync('./attribute_contribution.json');
		var array = JSON.parse(json_attributes_values);
		var weka_percentages = {};
		for (var id in array) {
			var attribute = array[id];
			weka_percentages[attribute.name] = parseFloat(attribute.ranking);
		}
		return new module.exports.filter_component(filterByPercentage,{'min_percentage':percentage,'percentage_list':weka_percentages});
	}
};

filterByName = function(current) {
	//var params = this.params;
	// if there is no parameters list, then the object is ok
	if (this.params.name_list === undefined) {
		return true;
	}
	// if we don't ask for minimum attributes, we are requiring all
	if (this.params.num_names === undefined) {
		this.params.num_names = this.params.name_list.length;
	}
	var tolerancy = this.params.name_list.length - this.params.num_names;
	if (tolerancy < 0) {return false;}
	for (var nameId in this.params.name_list) {
		if (current[this.params.name_list[nameId]] === undefined) {
			tolerancy--;
			if (tolerancy < 0) {return false;}
		}
	}
	return true;
};

filterByPercentage = function(current) {
	// if there is no minimum percentage, asume 0 (all is ok)
	if (this.params.min_percentage === undefined) {
		return true;
	}
	// if there are no list of percentages, there is no attribute that we can evaluate
	if (this.params.percentage_list === undefined) {
		return false;
	}
	var actual_percentage = 0;
	for (var attribute in current) {
		if(this.params.percentage_list[attribute] !== undefined) {
			actual_percentage += this.params.percentage_list[attribute];
		}
	}
	return (actual_percentage > this.params.min_percentage);
};

initFilterByPopularity = function(obj) {
	var listCharachters = [];
	console.log('init');
	for (var id in obj) {
		if (obj[id].name !== undefined) {
			listCharachters.push(obj[id].name);
		}
	}
	//popularity.getPopularityAll(listCharachters,'./pagerank');
	// promisedResults contains the result of the popularity query, just create a map with the score
	for (var resultId in popularity.promisedResults) {
		var result = popularity.promisedResults[resultId];
		console.log(result);
		if (result.error === undefined) {
			this.params.popularityByName[result.name] = result.score;
		}
	}
}

filterByPopularity = function(current) {
	console.log('popularity ' + current.name);
	if (current.name !== undefined && this.params.popularityByName[current.name] !== undefined) {
		return (this.params.popularityByName[current.name] > this.params.min_popularity);
	}
	return false;
}

function filterEach(obj,required_filters,optional_filters,num_true_filters) {
	if (num_true_filters === undefined) {
		// the default is one
		num_true_filters = fun_list.length - 1;
	}

	//init functions
	for (var filter in required_filters) {
		if (required_filters[filter].init !== undefined) {
			required_filters[filter].init(obj);
		}
	}
	for (var filter in optional_filters) {
		if (optional_filters[filter].init !== undefined) {
			optional_filters[filter].init(obj);
		}
	}

	// evaluate all objects
	for (var idObj = obj.length-1;idObj >= 0;idObj--) {
		// required filters
		for (var idRequired in required_filters) {
			console.log()
			var filter = required_filters[idRequired];
			if(!filter.fun(obj[idObj])) {
				obj.splice(idObj,1);
				break;
			}
		}
		// optional Filters
		if (obj[idObj] !== undefined) {
			for (var idOptional in optional_filters) {
				var tolerancy = optional_filters.length - num_true_filters;
				var filter = optional_filters[idOptional];
				if(!filter.fun(obj[idObj])) {
					tolerancy--;
					if (tolerancy < 0) {
						obj.splice(idObj,1);
						break;
					}
				}	
			}
		}
	}
	return obj;
}

