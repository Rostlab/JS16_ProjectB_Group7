module.exports = (function() {
	// remember to call init before using the object
	// to work it requires the file prediction.json to be in the current folder
	const fs = require('fs');
	this.data = {};
	this.init = function() {
		json_char = fs.readFileSync('./prediction.json','utf8');
		array = JSON.parse(json_char);
		for (id in array) {
			char = array[id];
			this.data[char.name] = char.plod;
		}
	};
	this.getPlod = function(name) {
		return parseFloat(this.data[name]);
	};

	return this;
})();