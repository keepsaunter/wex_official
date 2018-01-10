$(function(){
	wx.ready(function(){
		console.log('success');
		wx.onMenuShareAppMessage({
			title: 'test', // 分享标题
			desc: 'this is test', // 分享描述
			link: 'http://localhost:100/jade', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			success: function () {
			// 用户确认分享后执行的回调函数
				alert('chengg');
			},
			cancel: function () {
			// 用户取消分享后执行的回调函数
				alert('shibai');
			}
		});

		var localId = '';
		
		wx.stopRecord({
			success: function (res) {
				localId = res.localId;
				wx.playVoice({
					localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
				});
			}
		});
		wx.onVoiceRecordEnd({
			// 录音时间超过一分钟没有停止的时候会执行 complete 回调
			complete: function (res) {
				localId = res.localId;
				wx.playVoice({
					localId: localId // 需要播放的音频的本地ID，由stopRecord接口获得
				});
			}
		});

		wx.getNetworkType({
			success: function (res) {
				alert(res.networkType); // 返回网络类型2g，3g，4g，wifi
			}
		});

		$('a.play_audio').click(function(){
			wx.startRecord();
		});
	})
})