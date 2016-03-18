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
			if (n < this.optional_filters.length) {
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
	popularity_filter : function() {

	},

	// TODO: read attributes from weka and see if the rank reaches the percentage
	meaningful_attributes_filter : function (percentage) {
		// TODO: read from weka output file
		weka_percentages = {};
		return new module.exports.filter_component(filterByPercentage,{'min_percentage':percentage,'percentage_list':weka_percentages});
	}
};

filterByName = function(current) {
	//var params = this.params;
	// if there is no parameters list, then the object is ok
	console.log(params);
	if (params.name_list === undefined) {
		return true;
	}
	// if we don't ask for minimum attributes, we are requiring all
	if (params.num_names === undefined) {
		params.num_names = params.name_list.length;
	}
	var tolerancy = params.name_list.length - params.num_names;
	if (tolerancy < 0) {return false;}
	for (var nameId in name_list) {
		if (current[name_list[nameId]] === undefined) {
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
	for (var attributeId in current) {
		attribute = current[attributeId];
		if(params.percentage_list[attribute] !== undefined) {
			// todo: parse float?
			actual_percentage += params.percentage_list;
		}
	}
	return (actual_percentage > params.min_percentage);
};

function filterEach(obj,required_filters,optional_filters,num_true_filters) {
	if (num_true_filters === undefined) {
		// the default is one
		num_true_filters = fun_list.length - 1;
	}
	for (var idObj in obj) {
		// required filters
		for (var idRequired in required_filters) {
			var filter = required_filters[idRequired];
			if(!filter.fun(obj[idObj])) {
				delete obj[id];
				break;
			}
		}
		// optional Filters
		for (var idOptional in optional_filters) {
			var tolerancy = fun_list.length - num_true_filters;
			if(!filter.fun(obj[idObj])) {
				tolerancy--;
				if (tolerancy < 0) {
					delete obj[id];
					break;
				}
			}	
		}
	}
	return obj;
};

