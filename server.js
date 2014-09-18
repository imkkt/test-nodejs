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

var UserDataSchema = mongoose.Schema({
						userId:String,
						password:String,
						token:String
					});
var UserData = mongoose.model('user', UserDataSchema);

var CharDataSchema = mongoose.Schema({
						lv:Number,
						name:String,
						attack:Number,
						exp:Number,
						money:Number,
						userUId:String,
					});
var CharData = mongoose.model('char', CharDataSchema);



app.get('/', function (req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(loginPage.data);
})

app.get('/charSelect', function (req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(charSelectPage.data);
});

app.get('/main', function (req, res) {
	res.writeHead(200, {'Content-Type':'text/html'});
	res.end(mainPage.data);
});




app.post('/signup', function (req, res) {
	var newUser = new UserData({
		userId:req.body.userId,
		password:req.body.password,
		token:null
	});

	newUser.save(function (err){
		if (err) {
			console.error(err);
			res.writeHead(500, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:-1
			}));
			return;
		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify({
			code:0
		}));
	});
});


app.post('/login', function (req, res) {

	UserData.findOne({userId:req.body.userId, password:req.body.password}, function (err, user) {

		if (err) {
			console.error(err);
			res.writeHead(500, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:-1
			}));
			return;

		} else {
			var payload = {uuid:user._id, expire:Date.now()};

			user.token = jwt.encode(payload,'someSecret');
			user.save(function (err) {
				if (err) {
					console.error(err);
					res.writeHead(500, {'Content-Type':'application/json'});
					res.end(JSON.stringify({
						code:-1
					}));
					return;
				}

				res.writeHead(200, {'Content-Type':'application/json'});
				res.end(JSON.stringify({
					code:0,
					token:user.token
				}));
			});
		}
	});
});

function checkToken (token) {
	var payload = jwt.decode(token, 'someSecret');
	UserData.find({_id:payload.uuid, token:token}, function (err, user) {
		//if not, wrong token
	});

	if (payload.expire<Date.now()) {
		//token too old
	};

	return payload.uuid;
}

app.post('/getCharList', function (req, res) {
	console.log('[getCharList] token:', req.body.token);
	var uuid = checkToken(req.body.token);
	if (!uuid) {
		console.log('wrong token');
		return
	};

	CharData.find({userUId:uuid}, function (err, chars) {
		if (err) {
			console.error(err);
			res.writeHead(500, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:-1
			}));
			return;
		}

		var charList = [];
		for (var i=0; i<chars.length; ++i) {
			charList.push({
				lv:chars[i].lv,
				name:chars[i].name
			});
		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify({
			code:0,
			charList:charList
		}));
	});
});

app.post('/addChar', function (req, res) {
	console.log('[addChar] called');
	var uuid = checkToken(req.body.token);
	if (!uuid) {
		console.log('wrong token');
		return
	};

	var newChar = new CharData({
		lv:1,
		name:'kkt',
		attack:1,
		exp:0,
		money:0,
		userUId:uuid,
	});

	newChar.save(function (err) {
		if (err) {
			console.error(err);
			res.writeHead(500, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:-1
			}));
			return;
		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify({
			code:0,
			newChar:{
				lv:1,
				name:'kkt'
			}
		}));
	});
});

app.listen(3000);