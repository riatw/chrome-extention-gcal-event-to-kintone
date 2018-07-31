

/**
 * 日付をフォーマットする
 * @param  {Date}   date     日付
 * @param  {String} [format] フォーマット
 * @return {String}          フォーマット済み日付
 * http://qiita.com/osakanafish/items/c64fe8a34e7221e811d0
 */
var formatDate = function (date, format) {
	if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
	format = format.replace(/YYYY/g, date.getFullYear());
	format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
	format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	if (format.match(/S/g)) {
		var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
		var length = format.match(/S/g).length;
		for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
	}
	return format;
};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log(request);

	if ( request.method == "setData" ) {
		var stash = request.stash;
		var state = request.state;
		var date = request.date;

		var tableNum = 0;

		if ( state == "出社時" ) {
			tableNum = 0;

			// 作業実績を削除
			$(".subtable-gaia").eq(2).each(function() {
				$(this).find("tbody tr").not(":last").find(".remove-row-image-gaia").click();
				$(this).find("tbody tr").find("input[type='text']").val("");
				$(this).find("tbody tr").find("input[type='radio']:first").prop("checked","checked");
			});

			// 報告日をセット
			$("span:contains('報告日')").parents(".row-gaia").find(".input-date-text-cybozu").val(date );

			// 本日の優先順位をセット
			$(":contains('本日の優先順位(上から一番)')").parents(".row-gaia").next().find("tbody tr").not(":last").find(".remove-row-image-gaia").click();
			$(":contains('本日の優先順位(上から一番)')").parents(".row-gaia").next().find("input[type='text'], textarea").val("");

			var $selector = $(":contains('本日の優先順位(上から一番)')").parents(".row-gaia").next().find(".add-row-image-gaia");

			$(document).on('click', $selector, function () {
				$(":contains('本日の優先順位(上から一番)')").parents(".row-gaia").next().find("tbody tr").each(function(i) {
					$(this).find("input[type='text']").eq(0).val( i + 1 );
				})
			});

			if ( $(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr").length > 1 ) {

				var currentDate = new Date( $(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr:last").find("input[type='text']").val() );
				var currentStaus = $(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr:last").find("select").val();

				$(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr:last .add-row-image-gaia").click();

				currentDate.setDate( currentDate.getDate() + 1 );

				if ( currentDate.getDay() == 0 ) {
					currentDate.setDate( currentDate.getDate() + 1 );
				}
				else if ( currentDate.getDay() == 6 ) {
					currentDate.setDate( currentDate.getDate() + 2 );
				}

				$(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr:last").find("input[type='text']").eq(0).val( formatDate( currentDate, "YYYY-MM-DD") );

				$(":contains('直近の予定')").parents(".row-gaia").next().find("tbody tr:last").find("select").val( currentStaus );
			}
		}
		else {
			tableNum = 2;
		}

		var schedule1 = stash;

		$(".subtable-gaia").eq(tableNum).each(function() {
			var arr = schedule1;
			var $this = $(this);

			$this.find("tbody tr").not(":last").find(".remove-row-image-gaia").click();
			$this.find("tbody tr").find("input[type='text']").val("");

			for ( var i = 0; i < arr.length; i++ ) {
				var $target = $this.find("tbody tr").eq(i);
				var current = [];

				console.log(arr);
				console.log(arr[i]);
				console.log( arr[i]["starttime"] );
				console.log( arr[i]["endtime"] );
				console.log( arr[i]["summary"] );

				current.push( arr[i]["starttime"] );
				current.push( arr[i]["endtime"] );
				current.push( arr[i]["summary"] );

				$target.find("td:eq(0) .input-time-text-cybozu").val( current[0] );
				$target.find("td:eq(1) .input-time-text-cybozu").val( current[1] );
				$target.find("td:eq(4) .input-text-cybozu").val( current[2] );

				if ( i < arr.length - 1 ) {
					$this.find(".add-row-image-gaia").last().trigger("click");
				}
				else {
					$this.find(".add-row-image-gaia").last().trigger("click");
					$this.find(".remove-row-image-gaia").last().trigger("click");
				}
			}
		});
	}
});