import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const app = getApp();

Page({
  data: {
    userInfo: app.globalData.userInfo,
    publishButton: app.globalData.publishButton,

    activeTab: 0,
    
    showShare: false,
    shareOptions: [
      { name: '微信', icon: 'wechat', openType: 'share' },
    ],

    postList: [],
    timelineList: [],
    ratingList: [],
  },
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo, publishButton: app.globalData.publishButton });
  },
  getPostList: async function() {
    const res = await wx.cloud.callFunction({
      name: 'getPostList',
      data: { userId: true }
    });
    const postList = res.result.data;
    for (let post of postList) {
      post.createdAt = new Date(post.createdAt).toISOString().slice(0, 10);
    }
    this.setData({ postList });
  },
  getRatingList: async function() {
    const res = await wx.cloud.callFunction({
      name: 'getRatingList',
      data: { userId: true }
    });
    this.setData({ ratingList: res.result.data });
  },
  getTimelineList: async function() {
    const res = await wx.cloud.callFunction({
      name: 'getTimelineList',
      data: { userId: true }
    });
    const timelineList = res.result.data;
    for (let timeline of timelineList) {
      timeline.createdAt = new Date(timeline.createdAt).toISOString().slice(0, 10);
    }
    this.setData({ timelineList });
  },

  deleteTimeline: async function(data) {
    Toast.loading({
      message: '删除中...',
      duration: 0,
      forbidClick: true,
    });
    const { _id } = data.currentTarget.dataset.item;
    try {
      const res = await wx.cloud.callFunction({
        name: 'deleteTimeline',
        data: { _id }
      });
      console.log("res", res);
      if (res.result && res.result.stats.updated) {
        Toast.success('删除朋友圈成功');
        this.getTimelineList();
      } else {
        Toast.fail('删除朋友圈失败，网络错误');
      }
    } catch(e) {
      Toast.fail('删除朋友圈失败，网络错误');
      console.log(e);
    }
  },
  deletePost: async function(data) {
    Toast.loading({
      message: '删除中...',
      duration: 0,
      forbidClick: true,
    });
    const { _id } = data.currentTarget.dataset.item;
    try {
      const res = await wx.cloud.callFunction({
        name: 'deletePost',
        data: { _id }
      });
      if (res.result && res.result.stats.updated) {
        Toast.success('删除朋友圈成功');
        this.getPostList();
      } else {
        Toast.fail('删除朋友圈失败，网络错误');
      }
    } catch(e) {
      Toast.fail('删除朋友圈失败，网络错误');
      console.log(e);
    }
  },

  login() {
    Toast.loading({
      message: '登陆中...',
      duration: 0,
      forbidClick: true,
    });
    wx.getUserProfile({
      desc: '登录后即可使用更多功能~',
      success: user => {
        const { userInfo } = user;
        wx.cloud.callFunction({
          name: 'createUser',
          data: { userInfo },
          success: res => {
            if (res.result) {
              Toast.success('登录成功');
              this.setData({ userInfo });
              app.globalData.userInfo = userInfo;

              this.getPostList();
              this.getTimelineList();
              this.getRatingList();
            }
          },
          fail: _ => Toast.fail('登录失败，请检查网络')
        });
      },
      fail: _ => Toast.fail('登录后才可使用完整功能')
    });
  },

  onShow: function () { 
    this.getTabBar().init();

    this.getPostList();
    this.getTimelineList();
    this.getRatingList();
  },

  changeTab(e) {
    this.setData({ activeTab: e.detail.index});
  },

  // 平台公约
  showDocument() {
    Dialog.alert({
      message: '这个小程序的作用是给大家提供关于课程的一些咨询，给之后选课的同学提供一些参考；同时也有朋友圈发帖的功能；',
    }).then(() => {
    });
  },

  // 分享小程序
  shareApp() {
    this.setData({ showShare: true });
  },
  closeShare() {
    this.setData({ showShare: false });
  },
  selectShare(event) {
    this.closeShare();
  },

  // 联系作者
  contactAuthor() {
    Dialog.alert({
      message: '微信：cobain0714',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '复制',
      cancelButtonText: '知道啦'
    }).then(() => {
      wx.setClipboardData({
        data: 'cobain0714',
        success(res) {
          console.log("copy success");
        },
        fail(err) {
          console.log("err", err);
        }
      })
    }).catch(() => {
      // clicked cancel button
    });
  },
  closeDialog() {
    this.setData({ showDialog: false });
  },

  // 意见反馈
  openFeedback() {
    Dialog.alert({
      message: "如果发现小程序在使用过程中有任何 bug、需要改进的地方，或者觉得有需要添加的功能都可以向我反馈~ ",
      confirmButtonText: "去反馈",
      confirmButtonOpenType: "feedback",
      showCancelButton: "true",
      cancelButtonText: "知道啦"
    }).then(() => {
      // clicked confirm button
    }).catch(() => {  
      // clicked cancel button
    })
  },

  previewImage(data) {
    const { images, index } = data.currentTarget.dataset;
    wx.previewImage({
      current: images[index],
      urls: images,
    });
  },
})