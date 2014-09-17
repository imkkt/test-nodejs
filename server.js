var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
var jwt = require('jwt-simple');

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

var UserDataSchema = mongoose.Schema({userId:String, password:String, token:String})
var UserData = mongoose.model('user', UserDataSchema);

app.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(loginPage.data);
})


app.post('/signup', function (req, res) {
	console.log(req.body.userId, req.body.password);

	var newUser = new UserData({userId:req.body.userId, password:req.body.password, token:null});
	newUser.save();
	res.end()
});


app.post('/login', function (req, res) {

	UserData.find({userId:req.body.userId, password:req.body.password}, function (err, users) {

		var loginResult = {code:-1};

		if (err) {
			console.error(err);

		} else {

			if (users.length == 1) {
				var user = users[0];
				var payload = {uuid:user._id, expire:Date.now()};

				loginResult.code=0;
				loginResult.token = jwt.encode(payload,'someSecret');

				user.token = loginResult.token;
				user.save(function (err) {
					if (err) { console.error(err); }

					console.log('login user!', user);
					console.log('uuid:',payload.uuid,'expire:',payload.expire);
				});
			}

		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify(loginResult));
	});
});

app.post('/charSelect', function (req, res) {

	console.log('token', req.body.token);

	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(charSelectPage.data);

});

app.listen(3000);