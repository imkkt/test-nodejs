var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');

var loginPage = {data:null};
var charSelectPage = {data:null};
var mainPage = {data:null};

var loadPageNum = 0;
var loadPage = function ( name, saveTo ) {
	fs.readFile(name, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			saveTo.data = data;
		}
	});	
}

loadPage('login.html', loginPage);
loadPage('charSelect.html', charSelectPage);
loadPage('main.html', mainPage);

mongoose.connect('mongodb://localhost/mydb');

var db = mongoose.connection;
db.on('error', function (err) {
	console.error('mongoose connection error:', err);
	process.exit(1);
});

var app = express();
app.use(express.static(path.join(__dirname,'/')));
app.use(bodyParser.json({type:'application/json'}));

var UserDataSchema = mongoose.Schema({userId:String, password:String})
var UserData = mongoose.model('user', UserDataSchema);

app.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(loginPage.data);
})


app.post('/signup', function (req, res) {
	console.log(req.body.userId, req.body.password);

	var newUser = new UserData({userId:req.body.userId, password:req.body.password});
	newUser.save();
	res.end()
});


app.post('/login', function (req, res) {
	req.body.userId;

	UserData.find({userId:req.body.userId, password:req.body.password}, function (err, users) {

		var resultData = {code:-1};

		if (err) {
			console.error(err);

		} else {

			if (users.length > 0) {
				console.log('find user!', users);
				resultData.code=0;
			}

		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify(resultData));
	});
});

app.listen(3000);