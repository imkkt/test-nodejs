$(document).ready(function () {

	function alertMessage (id, msg) {
		$('#alertHolder').html(
			'<div class="alert alert-error id="'+id+'"><a class="close" data-dismiss="alert">&times;</a><h4>'+msg+'</h4></div>'
		);
		window.setTimeout(function() {
			$('#alertHolder').html('');
		}, 2000);
	};

	$("#loginForm").bind('keydown', function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
		}
	});
	$("#signUpForm").bind('keydown', function (e) {
		if (e.keyCode == 13) {
			e.preventDefault();
		}
	});

	$("#loginBtn").click( function (e) {
		var formData = {
			userId:$("#userId").val(),
			password:$("#password").val()
		};

		$.ajax({
			type: "POST",
			url: "/login",
			data: JSON.stringify(formData),
			dataType: "json",
			contentType: "application/json",
			success: function (data) {
				if (data.code!=0) {
					alertMessage('loginError', 'Login failed. Please retry.');
				} else {
					location.href = "/";
				}
			}
		});
		e.preventDefault();
	});

	$("#signUpBtn").click( function (e) {
		var formData = {
			userId:$("#newUserId").val(),
			password:$("#newPassword").val()
		};

		$.ajax({
			type: "POST",
			url: "/signup",
			data: JSON.stringify(formData),
			dataType: "json",
			contentType: "application/json"
		});

		$("#signUpModal").hide();
		e.preventDefault();
	});

});