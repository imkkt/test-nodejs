var fs = require('fs');
var path = require('path');

module.exports = function (targetDir, targetExt, callback) {
	var buffer = fs.readdir(targetDir, function (err, list) {
	
		if (err) {
			callback(err);
			return;
		}

		var newList = [];
		for (var i = 0; i < list.length; ++i) {
			if (path.extname(list[i]) == ('.'+targetExt)) {
				newList.push(list[i]);
			}
		};

		callback(null, newList);
	});
};