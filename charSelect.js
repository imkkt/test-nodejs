function alertMessage (id, msg) {
	$('#alertHolder').html(
		'<div class="alert alert-error id="'+id+'"><a class="close" data-dismiss="alert">&times;</a><h4>'+msg+'</h4></div>'
	);
	window.setTimeout(function() {
		$('#alertHolder').html('');
	}, 3000);
};

function charRowHtml(lv, name) {
	return '<div class="row show-grid">\
				<div class="span2">Lv:'+lv+'</div><div class="span4">Name:'+name+'</div>\
				<button class="btn selCharBtn" data-toggle="modal" data-target="#selCharModal">select</button>\
				<button class="btn delCharBtn">delete</button>\
			</div>'
}

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
		var charListHtml = '';
		for (var i=0; i<charList.length; ++i) {
			charListHtml += charRowHtml(charList[i]['lv'], charList[i]['name']);
		}
		$('#charListHolder').html(charListHtml);
	});

	$("body").on("click", ".delCharBtn", function (e) {
		var charRow = $(this).parent();
		var charIndex = charRow.index();

		$.ajax({
			type: "POST",
			url: "/delChar",
			data: JSON.stringify({
				token:localStorage.token,
				charIndex:charIndex
			}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {

			if (data.code!=0) {
				alertMessage('delCharError', 'Del character failed. Please retry.');
				return;
			}
			charRow.remove();
		});

		e.preventDefault();
	});

	var selCharInfo = null;
	$("body").on("click", ".selCharBtn", function (e) {
		var charIndex = $(this).parent().index();

		$.ajax({
			type: "POST",
			url: "/getCharInfo",
			data: JSON.stringify({
				token:localStorage.token,
				charIndex:charIndex,
			}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {
			
			selCharInfo = data.charInfo;
			$('#lvModel').text(data.charInfo.lv);
			$('#nameModel').text(data.charInfo.name);
			$('#hpModel').text(data.charInfo.nowHp);
			$('#attackModel').text(data.charInfo.attack);
			$('#expModel').text(data.charInfo.exp);
			$('#moneyModel').text(data.charInfo.money);

			localStorage['charInfo'] = JSON.stringify(selCharInfo);
		});

		localStorage['nowChar'] = charIndex;
		e.preventDefault();
	});

	$("#addCharBtn").click( function (e) {

		$.ajax({
			type: "POST",
			url: "/addChar",
			data: JSON.stringify({token:localStorage.token, charName:$("#charName").val()}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {

			if (data.code!=0) {
				alertMessage('addCharError', 'Add character failed. Please retry.');
				return;
			}

			var nowCharCount = $('#charListHolder row').length;
			$('#charListHolder').append( charRowHtml(data.newChar['lv'],data.newChar['name']) );
		});

		e.preventDefault();
	});

	$("#goMainBtn").click( function (e) {
		window.location.replace('/main');
		e.preventDefault();
	});

});