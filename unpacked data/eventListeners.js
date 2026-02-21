window.addEventListener('message', async (e) => {
  const message = e.data;

  if (message === 'getCurrentTime') {
    try {
      const timestamp = JSON.stringify(
        Object.values(
          netflix.appContext.state.playerApp.getStore().getState()
            .videoPlayer.playbackStateBySessionId
        )[0].currentTime
      );
      e.source.postMessage(`timestamp/${timestamp}`, e.origin);
    } catch (_) {
      e.source.postMessage('timestamp/false', e.origin);
    }
  }

  if (typeof message === 'string' && message.split('/')[0] === 'seek') {
    try {
      const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
      const session = videoPlayer.getAllPlayerSessionIds()[0];
      const player = videoPlayer.getVideoPlayerBySessionId(session);
      player.seek(parseInt(message.split('/')[1], 10));
    } catch (_) { }
  }

  if (message === 'getVideoData') {
    try {
      const url = window.location.href;
      const videoCode = url.split('/')[4].slice(0, 8);
      const title =
        netflix.appContext.state.playerApp.getState().videoPlayer
          .videoMetadata[videoCode]._video._video.title;
      const videoData =
        netflix.appContext.state.playerApp.getState().playerApp
          .playableDataByVideoId[videoCode];
      let episode = null, season = null, videoType = null;
      if (videoData) videoType = videoData.summary.type;
      if (videoType === 'episode') {
        episode = videoData.summary.episode;
        season = videoData.summary.season;
      }
      e.source.postMessage({ title, season, episode, messageContent: 'videoData' }, e.origin);
    } catch (_) {
      e.source.postMessage({ messageContent: 'videoData', error: true }, e.origin);
    }
  }

  if (message === 'getVideoCode') {
    const splitUrl = window.location.href.split('/');
    e.source.postMessage({ messageContent: 'videoCode', videoCode: splitUrl[4].slice(0, 8) }, e.origin);
  }

  if (message === 'closeWindow') {
    window.close();
  }
});
