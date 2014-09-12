var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/mydb');

var db = mongoose.connection;
db.on('error', function (err) {
	console.error('mongoose connection error:', err);
	process.exit(1);
});

var app = express();
app.use(bodyParser.json({type:'application/json'}));

var userSchema = mongoose.Schema({id:String,pw:String});
var userModel = mongoose.model('user', userSchema);

app.post('/login', function(req, res) {
	console.log('req id-',req.body.id,'pw-',req.body.pw);


	userModel.find( function (err, users) {
		console.log('find:', users);
	});

	res.end();
});

app.post('/join', function(req, res) {
	console.log('req id-',req.body.id,'pw-',req.body.pw);

	var newUser = new userModel({id:req.body.id,pw:req.body.pw});
	newUser.save();

	res.end();
});

app.listen(3000);

// db.once('open', function callback() {
// 	console.log('success!');

// 	var testDataSchema = mongoose.Schema({}, {collection:'testData'});
// 	var testData = mongoose.model('testData', testDataSchema);

// 	testData.find(function (err, things) {
// 		if(err) return console.error(err);
// 		console.log(things);
// 	});
// });