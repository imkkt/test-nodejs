var path = require('path');

console.log(path.join(__dirname, 'templates'))

/*

[request]		[response]

join			success

login			success + character list

select character	character detail

doSome(#num)	event(eventText + graphic + doSome list)

*/