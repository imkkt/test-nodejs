function alertMessage (id, msg) {
	$('#alertHolder').html(
		'<div class="alert alert-error id="'+id+'"><a class="close" data-dismiss="alert">&times;</a><h4>'+msg+'</h4></div>'
	);
	window.setTimeout(function() {
		$('#alertHolder').html('');
	}, 3000);
};

$(document).ready(function () {

	$.ajax({
		type: "POST",
		url: "/getCharList",
		data: JSON.stringify({token:localStorage.token}),
		dataType: "json",
		contentType: "application/json"
	}).done(function (data) {

		if (data.code!=0) {
			alertMessage('getCharListError', 'Get character list failed. Please retry.');
			return;
		}

		//data = simple char list info
		var charList = data.charList;
		for (var i=0; i<charList.length; ++i) {
			console.log('char:',i,charList[i]['lv'],charList[i]['name']);
		}
		//to do here

	});

	$("#selCharBtn").click( function (e) {

		$.ajax({
			type: "POST",
			url: "/getCharInfo",
			data: JSON.stringify({
				token:localStorage.token,
				charIndex:
			}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {

		});

		localStorage['nowChar'] = 123;
		window.location.replace('/main');
		e.preventDefault();
	});

	$("#addCharBtn").click( function (e) {

		$.ajax({
			type: "POST",
			url: "/addChar",
			data: JSON.stringify({token:localStorage.token}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {

			if (data.code!=0) {
				alertMessage('addCharError', 'Add character failed. Please retry.');
				return;
			}

			console.log('addChar result:',data.newChar);
		});

		e.preventDefault();
	});

});