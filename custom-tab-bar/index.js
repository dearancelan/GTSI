const app = getApp();

Component({
  data: {
    publishButton: app.globalData.publishButton,

    active: 0,
    list: [
      {
        "url": "/pages/course/index",
        "icon": "coupon-o",
        "text": "选课"
      },
      {
        "url": "/pages/feed/index",
        // "icon": "/image/pengyouquan.png",
        "icon": "notes-o",
      },
      {
        "url": "/pages/user/index",
        "icon": "user-o",
        "text": "我的"
      }
    ]
  },
  attached() {

  },
  methods: {
    onChange(e) {
      this.setData({
        active: e.detail
      });
      wx.switchTab({
        url: this.data.list[e.detail].url
      });
    },
    init() {
      const page = getCurrentPages().pop();
      this.setData({
        active: this.data.list.findIndex(item => item.url === `/${page.route}`),
      });
    }
  }
});