function alertMessage (id, msg) {
	$('#alertHolder').html(
		'<div class="alert alert-error id="'+id+'"><a class="close" data-dismiss="alert">&times;</a><h4>'+msg+'</h4></div>'
	);
	window.setTimeout(function() {
		$('#alertHolder').html('');
	}, 3000);
};

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	};
}

var battleText = [
    "<p>{0}의 공격!</p>",
    "<p>{0}의 회심의 일격!!</p>",
    "<p>{0}(은)는 {1}의 피해를 입었다.</p>",
    "<p>하지만 {0}(은)는 회피했다.</p>",
    "<p>{0}(은)는 쓰러졌다.</p>",
    "<p>{0}(은)는 기절했다.</p>",
    "<p>Exp를 {0} 획득했다.</p>",
    "<p>{0}의 레벨이 {1} 올랐다!</p>",
    "<p>Hp가 {0} 상승했다.</p>",
    "<p>Attack이 {0} 상승했다.</p>",
    "<p>{0}는 휴식을 취했다. 피로가 서서히 가시는 느낌이다.. 체력이 전부 회복되었다.</p>",
    "<p>체력이 부조카당 휴식이 필요하다</p>"
];

var PLAYER_ATTACK = 1;
var PLAYER_CRITICAL = 2;
var PLAYER_HIT = 3;
var PLAYER_AVOID = 4;
var MOB_ATTACK = 5;
var MOB_CRITICAL = 6;
var MOB_HIT = 7;
var MOB_AVOID = 8;

$(document).ready(function () {

	var charInfo = JSON.parse(localStorage['charInfo']);
	$('#name').text(charInfo.name);
	$('#hp').text(charInfo.nowHp);
	$('#exp').text(charInfo.exp);
	$('#lv').text(charInfo.lv);

	$('#battleBtn').click( function (e) {
		if (charInfo.nowHp==0) {
			$('#eventText').html(battleText[11]);
			return;
		}

		$.ajax({
			type: "POST",
			url: "/battle",
			data: JSON.stringify({
				token:localStorage['token'],
				charIndex:localStorage['nowChar']
			}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {
			//$('#eventText').text();

			var battleLog = data.battleResult.log;
			var mobName = data.battleResult.mobName;
			var playerHp = data.battleResult.hp;
			var expChange = data.battleResult.expChange;
			var levelChange = 0;

			var nowExp = charInfo.exp+expChange;
			var maxExp = charInfo.lv*30+20;
			while(nowExp>=maxExp) {
				levelChange+=1;
				nowExp-=maxExp;
				maxExp=charInfo.lv*30+20;
			}

		    charInfo.lv += levelChange;
		    charInfo.exp = nowExp;
		    charInfo.nowHp = playerHp;
		    localStorage['charInfo'] = JSON.stringify(charInfo);

		    $('#lv').text(charInfo.lv);
		    $('#exp').text(charInfo.exp);
		    $('#hp').text(charInfo.nowHp);

			var eventText = "";

			for(var i=0; i<battleLog.length; ++i) {
				switch (battleLog[i]) {
					case PLAYER_ATTACK:
						eventText += battleText[0].format(charInfo.name);
					break;
					case PLAYER_CRITICAL:
						eventText += battleText[1].format(charInfo.name);
					break;
					case PLAYER_HIT:
						eventText += battleText[2].format(charInfo.name, battleLog[i+1]);
						i+=1;
					break;
					case PLAYER_AVOID:
						eventText += battleText[3].format(charInfo.name);
					break;
					case MOB_ATTACK:
						eventText += battleText[0].format(mobName);
					break;
					case MOB_CRITICAL:
					eventText += battleText[1].format(mobName);
					break;
					case MOB_HIT:
						eventText += battleText[2].format(mobName, battleLog[i+1]);
						i += 1;
					break;
					case MOB_AVOID:
						eventText += battleText[3].format(mobName);
					break;

					default:
					break;
				}
			}
		    
		    if (playerHp == 0) {
				eventText += battleText[5].format(charInfo.name);
		    }
		    else {
		    	eventText += battleText[4].format(mobName);
		    	eventText += battleText[6].format(expChange);
		        
		        if (levelChange > 0) {
		        	eventText += battleText[7].format(charInfo.name, levelChange);
		        }
		    }

		    $('#eventText').html(eventText);

		});

		e.preventDefault();
	})

	$('#restBtn').click( function (e) {
		$.ajax({
			type: "POST",
			url: "/rest",
			data: JSON.stringify({
				token:localStorage['token'],
				charIndex:localStorage['nowChar']
			}),
			dataType: "json",
			contentType: "application/json"
		}).done(function (data) {
			$('#hp').text(data.hp);
			charInfo.nowHp = data.hp;
		    localStorage['charInfo'] = JSON.stringify(charInfo);
		});
		e.preventDefault();
	})

});