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
		url: "/selectChar",
		data: JSON.stringify(formData),
		dataType: "json",
		contentType: "application/json"
	}).done(function (data) {
		//data = detail char info

		if (data.code!=0) {
			alertMessage('selectCharError', 'Select character failed. Please retry.');
			return;
		}

		for (var i=0; i<data.length; ++i) {
			var level = data[i]['level'];
			var name = data[i]['name'];
			console.log('level',level,'name:',name);
		}

		window.location.replace('/main');
	});
}