var express = require('express');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var app = express();

app.get('/books', function(req, res) {
	fs.readFile(process.argv[3], function(err, data) {
		if(err) {
			res.send(500);
		}
		var parsedObj = JSON.parse(data);
		res.json(parsedObj);
	});
});

//app.use(bodyParser.urlencoded({extended:false}));
//app.use(express.static(process.argv[3]||path.join(__dirname,'public')));
//app.use(stylus.middleware(process.argv[3]||__dirname+'public'));

// app.put('/path/:NAME', function(req, res) {
// 	res.end( crypto.createHash('sha1').update(new Date().toDateString() + req.params.NAME).digest('hex') );
// });

app.get('/search', function(req, res) {
	res.send(req.query);
});

// app.set('view engine', 'jade')
// app.set('views', process.argv[3]);

// app.get('/home', function(req, res) {
// 	res.end('Hello World!');
// 	res.render('index', {date: new Date().toDateString()})
// });

// app.post('/form',function(req, res) {
// 	res.end(req.body.str.split('').reverse().join(''));
// });

app.listen(process.argv[2]);