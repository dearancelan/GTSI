import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp();

Page({
  data: {
    userInfo: app.globalData.userInfo,
    publishButton: app.globalData.publishButton,

    searchValue: '',

    showTimelineForm: false,
    timelineContent: '',
    timelineImages: [],
  },
  onLoad() {
    this.setData({ publishButton: app.globalData.publishButton });

    this.getTimelineList();
  },
  login() {
    Toast({
      message: '请先登录后再使用该功能', 
      forbidClick: true,
      onClose: () => {
        wx.switchTab({
          url: '/pages/user/index'
        });
      }
    });
  },
  getTimelineList: async function() {
    const { searchValue } = this.data;
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTimelineList',
      });
      let data = res.result.data;
      for (let timeline of data) {
        timeline.createdAt = new Date(timeline.createdAt).toISOString().slice(0, 10);
      }
      if (searchValue) {
        data = data.filter(f => f.timelineContent.indexOf(searchValue) !== -1);
      }
      this.setData({ timelineList: data });
    } catch(e) {
      Toast.fail('获取帖子列表失败，请检查网络');
      console.log("getTimelineList error", e);
    } 
  },

  changeSearchValue(event) {
    this.setData({ searchValue: event.detail });
  },
  search() {
    this.getTimelineList();
  },

  
  showTimelineForm() {
    this.setData({ showTimelineForm: true });
  },
  closeTimelineForm() {
    this.setData({ showTimelineForm: false });
  },
  uploadTimelineImage(event) {
    const { timelineImages } = this.data;
    const newArray = timelineImages.concat(event.detail.file);
    this.setData({ timelineImages: newArray });
  },
  deleteImage(event) {
    const { timelineImages } = this.data;
    timelineImages.splice(event.detail.index, 1);
    this.setData({ timelineImages });
  },
  publishTimeline: async function() {
    Toast.loading({
      message: '发布中...',
      duration: 0,
      forbidClick: true,
    });
    const { timelineContent, timelineImages, userInfo } = this.data;
    if (!timelineContent) {
      Toast('内容不能为空');
      return;
    }

    const uploadFilePromise = (fileName, chooseResult) => {
      return wx.cloud.uploadFile({
        cloudPath: fileName,
        filePath: chooseResult.url
      });
    }
    const uploadTasks = timelineImages.map((file, index) => uploadFilePromise("timelineImages/" + new Date().getTime(), file));
    const files = await Promise.all(uploadTasks);
    const fileIDs = files.map(item => item.fileID);

    const res = await wx.cloud.callFunction({
      name: 'publishTimeline',
      data: { timelineContent, fileIDs, userInfo }
    });
    Toast.clear();
    if (res.result) {
      Toast.success('发布帖子成功');
      this.getTimelineList();
    } else {
      Toast.fail('发布帖子失败，请检查网络');
    }
    this.setData({ showTimelineForm: false });
  },

  onShow: function () { 
    this.getTabBar().init();
    this.setData({ userInfo: app.globalData.userInfo });
  },

  previewImage(data) {
    const {images, index } = data.currentTarget.dataset;
    wx.previewImage({
      current: images[index],
      urls: images,
    });
  },
})