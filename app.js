// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-3gdctq584a67ea27',
      traceUser: true,
    });

    wx.cloud.callFunction({ name: 'getUser' })
    .then(res => {
      if (res.result.data.length > 0) {
        this.globalData.userInfo = res.result.data[0].userInfo;
      }
      console.log("when app launch:", this.globalData.userInfo);
    });

    const db = wx.cloud.database();
    db.collection('config').limit(1).get()
    .then(res => {
      this.globalData.publishButton = res.data[0].publishButton;
    }).catch(err => {
      console.error(err);
    })
  },

  globalData: {
    userInfo: null,
    publishButton: 0,
  }
})
