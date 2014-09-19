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

var Schema = mongoose.Schema;
var UserDataSchema = Schema({

	userId:String,
	password:String,
	token:String,
	charList:[{type:Schema.Types.ObjectId, ref:'char'}]
});
var UserData = mongoose.model('user', UserDataSchema);

var CharDataSchema = Schema({

	lv:Number,
	name:String,
	attack:Number,
	nowHp:Number,
	exp:Number,
	money:Number,
	owner:{type:Schema.Types.ObjectId, ref:'user'},
});
var CharData = mongoose.model('char', CharDataSchema);


var MobDataSchema = Schema({
	name:String,
	attack:Number,
	maxHp:Number,
	avoidProb:Number,
	criticalProb:Number,
	exp:Number
});
var MobData = mongoose.model('mob', MobDataSchema);
var mobs = null;
MobData.find(function (err, result) {
	mobs = result;
});

// var a = new MobData({
// 	name:'들쥐',
// 	attack:2,
// 	maxHp:10,
// 	avoidProb:0.2,
// 	criticalProb:0.05,
// 	exp:10
// });
// a.save();
// var b = new MobData({
// 	name:'고블린',
// 	attack:10,
// 	maxHp:30,
// 	avoidProb:0.1,
// 	criticalProb:0.1,
// 	exp:25
// });
// b.save();
// var c = new MobData({
// 	name:'오크',
// 	attack:20,
// 	maxHp:50,
// 	avoidProb:0.05,
// 	criticalProb:0.15,
// 	exp:50
// });
// c.save();

var dbDataCache = {};



function userProcess( userId, callback ) {
	var cachedUser = dbDataCache[userId];
	if( cachedUser ) {
		callback(null, cachedUser);
		return;
	}

	UserData.findOne({userId:userId})
	.populate('charList', 'lv name')
	.exec(function (err, user) {

		if (err) {
			callback(err, user);
			return;
		}

		dbDataCache[userId] = user;
		callback(null, user);
	});
}

function checkToken (token) {
	var payload = jwt.decode(token, 'someSecret');
	UserData.find({_id:payload.uuid, token:token}, function (err, user) {
		//if not, wrong token
	});

	if (payload.expire<Date.now()) {
		//token too old
	};

	return payload;
}

function responseJsonError(res, code) {
	console.error(err);
	res.writeHead(code, {'Content-Type':'application/json'});
	res.end(JSON.stringify({
		code:-1
	}));
}



var app = express();
app.use(express.static(path.join(__dirname,'/')));
app.use(bodyParser.json({type:'application/json'}));

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
		token:null,
		charList:null
	});

	newUser.save(function (err){
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify({
			code:0
		}));

		dbDataCache[req.body.userId] = newUser;
	});
});

app.post('/login', function (req, res) {

	userProcess( req.body.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		if (!user) {
			res.writeHead(200, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:-1
			}));
			return;
		}

		var payload = {uuid:user._id, userId:user.userId, expire:Date.now()};

		user.token = jwt.encode(payload,'someSecret');
		user.save(function (err) {
			if (err) {
				responseJsonError(res, 500);
				dbDataCache[user.userId] = null;
				return;
			}

			res.writeHead(200, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:0,
				token:user.token
			}));
		});
	} );

});

app.post('/getCharList', function (req, res) {
	
	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		res.writeHead(200, {'Content-Type':'application/json'});
		res.end(JSON.stringify({
			code:0,
			charList: (user.charList==null? []:user.charList)
		}));
	});

});

app.post('/getCharInfo', function (req, res) {
	
	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		//CharData.findById(user.charList[req.body.charIndex]._id, '-_id -owner', function (err, char) {
		UserData.populate(user, {path:'charList', select:'-_id -owner'}, function (err, user) {
			if (err) {
				responseJsonError(res, 500);
				return;
			}
			user.isGetInfo = true;

			res.writeHead(200, {'Content-Type':'application/json'});
			res.end(JSON.stringify({
				code:0,
				//charInfo:char
				charInfo:user.charList[req.body.charIndex]
			}));
		});
	});

});

app.post('/addChar', function (req, res) {

	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		var newChar = new CharData({
			lv:1,
			name:req.body.charName,
			attack:10,
			nowHp:90,
			exp:0,
			money:0,
			owner:payload.uuid,
		});

		newChar.save(function (err) {
			if (err) {
				responseJsonError(res, 500);
				return;
			}

			if(!user.charList) {
				user.charList = [];
			}
			user.charList.push(newChar);

			user.save( function (err) {
				if (err) {
					responseJsonError(res, 500);
					return;
				}

				UserData.populate(user, {path:'charList', select:'lv name'}, function (err, user) {
					if (err) {
						responseJsonError(res, 500);
						return;
					}

					res.writeHead(200, {'Content-Type':'application/json'});
					res.end(JSON.stringify({
						code:0,
						newChar:{
							lv:1,
							name:req.body.charName
						}
					}));
				});
			} );
		});
	});
});

app.post('/delChar', function (req, res) {

	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		var delChar = user.charList[req.body.charIndex];
		delChar.remove(function (err) {
			if (err) {
				responseJsonError(res, 500);
				return;
			}

			user.charList.splice(req.body.charIndex,1);
			user.save( function (err) {
				if (err) {
					responseJsonError(res, 500);
					return;
				}

				res.writeHead(200, {'Content-Type':'application/json'});
				res.end(JSON.stringify({
					code:0
				}));

				// UserData.populate(user, {path:'charList', select:'lv name'}, function (err, user) {
				// 	if (err) {
				// 		responseJsonError(res, 500);
				// 		return;
				// 	}

				// 	res.writeHead(200, {'Content-Type':'application/json'});
				// 	res.end(JSON.stringify({
				// 		code:0
				// 	}));
				// });
			} );
		});
	});
});

app.post('/rest', function (req, res) {
	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {

		function doNext() {
			var targetChar = user.charList[req.body.charIndex];

			targetChar.nowHp = targetChar.lv*30 + 60;
			targetChar.save( function (err) {
				if (err) {
					responseJsonError(res, 500);
					return;
				}

				res.writeHead(200, {'Content-Type':'application/json'});
				res.end(JSON.stringify({
					code:0,
					hp:targetChar.hp
				}));
			});
		}

		if( user.isGetInfo ) {
			doNext(null, user);
		} else {
			UserData.populate(user, {path:'charList'}, doNext);	
		}
	});
});

var PLAYER_ATTACK = 1;
var PLAYER_CRITICAL = 2;
var PLAYER_HIT = 3;
var PLAYER_AVOID = 4;
var MOB_ATTACK = 5;
var MOB_CRITICAL = 6;
var MOB_HIT = 7;
var MOB_AVOID = 8;

app.post('/battle', function (req, res) {
	var payload = checkToken(req.body.token);
	if (!payload) {
		console.log('wrong token');
		return;
	};

	userProcess( payload.userId, function (err, user) {
		if (err) {
			responseJsonError(res, 500);
			return;
		}

		var doNext = function (err, user) {
			if (err) {
				responseJsonError(res, 500);
				return;
			}

			var targetChar = user.charList[req.body.charIndex];

			var mobIndex = Math.floor(Math.random()*100) % mobs.length;
			var mobObj = mobs[mobIndex];

			var mobName = mobObj.name;
			var mobHp = mobObj.maxHp;
			var mobAttack = mobObj.attack;
			var mobAvoidProb = mobObj.avoidProb;
			var mobCriticalProb = mobObj.criticalProb;
			var playerLevel = targetChar.lv;
			var playerHp = targetChar.nowHp;
			var playerAttack = targetChar.attack;
			var playerExp = targetChar.exp;
			var levelChange = 0;
			var expChange = 0;

			//battle code
			var battleLog = [];
			while(true) {
				var playerAttackResult = PLAYER_ATTACK;
				if (Math.random() < 0.15) {
					playerAttackResult = PLAYER_CRITICAL;
				}
				battleLog.push(playerAttackResult);

				if (Math.random() < mobAvoidProb) {
					battleLog.push(MOB_AVOID);
				}
				else {
					battleLog.push(MOB_HIT);

					var playerDamage = Math.floor(targetChar.attack*( 1 + (Math.random()*0.4-0.2)));
					if (playerAttackResult == PLAYER_CRITICAL)
						playerDamage *= 2;

					battleLog.push( playerDamage )
					mobHp -= playerDamage;
				}

				if (mobHp<=0) {
					expChange = mobObj.exp;
					playerExp += expChange;
					var maxExp = playerLevel*30+20;

					while ( playerExp >= maxExp ) {
						levelChange += 1; 
						playerExp -= maxExp;
						playerLevel += 1;
						maxExp = playerLevel*30+20;
					}

					targetChar.exp = playerExp;
					targetChar.lv = playerLevel;
					break;
				}



				var mobAttackResult = MOB_ATTACK;
				if (Math.random() < mobCriticalProb) {
					mobAttackResult = MOB_CRITICAL;
				}
				battleLog.push(mobAttackResult);

				if (Math.random() < 0.15) {
					battleLog.push(PLAYER_AVOID);
				}
				else {
					battleLog.push(PLAYER_HIT);

					var mobDamage = Math.floor(mobAttack*( 1 + (Math.random()*0.4-0.2)));
					if (mobAttackResult == MOB_CRITICAL)
						mobDamage *= 2;

					battleLog.push( mobDamage )
					playerHp -= mobDamage;
				}

				if (playerHp<=0) {
					playerHp=0;
					break;
				}
			}

			targetChar.hp = playerHp;
			targetChar.save( function (err) {
				if (err) {
					responseJsonError(res, 500);
					return;
				}

				var result = {
					mobName: mobName,
					mobHp: mobHp,
					hp: playerHp,
					expChange: expChange,
					log: battleLog,
				};

				res.writeHead(200, {'Content-Type':'application/json'});
				res.end(JSON.stringify({
					code:0,
					battleResult:result
				}));
			});
		};

		if( user.isGetInfo ) {
			doNext(null, user);
		} else {
			UserData.populate(user, {path:'charList'}, doNext);	
		}
	})
});

app.listen(3000);