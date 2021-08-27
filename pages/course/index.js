import '../../miniprogram_npm/@vant/weapp/notify/notify';

Page({
  data: {
    courses: {},
    majors: [],
  },
  onShow: function () { 
    this.getTabBar().init();
  },
  onLoad: function() {
    const res = wx.cloud.callFunction({
      name: 'getCourses'
    }).then(res => {
      const courses = res.result.list;
      this.setData({courses, majors: courses.map(f => f._id)});
    }).catch(e => {
      Notify({ type: 'danger', message: '获取课程列表失败，请检查网络' });
      console.error(e);
    })
  },

  onShareAppMessage() {
    return {
      title: 'GTSI',
    }
  }
});