import '../../miniprogram_npm/@vant/weapp/notify/notify';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

const app = getApp();

Page({
  data: {
    course: {},
    courseId: 0,
    major: '',
    code: '',
    title: '',

    activeTab: 0,
    showPostForm: false,
    showRatingForm: false,

    ratingValue: 10,
    ratingContent: '',
    averageRating: null,

    postContent: null,
    postImages: [],

    ratingList: [],
    postList: [],

    userInfo: app.globalData.userInfo,
    publishButton: app.globalData.publishButton,
  },
  onLoad: function(options) {
    const { id, major, code, title } = options;
    this.setData({courseId: id, major, code, title, userInfo: app.globalData.userInfo, publishButton: app.globalData.publishButton});

    this.getRatingList();
    this.getPostList();
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

  changeTab(event) {
    this.setData({
      activeTab: event.detail,
    });
  },

  getRatingList: async function() {
    const list = await wx.cloud.callFunction({
      name: 'getRatingList',
      data: { courseId: this.data.courseId }
    });
    const ratings = list.result.data;
    let total = 0;
    for (let rating of ratings) {
      total += rating.rating;
    }

    this.setData({ ratingList: list.result.data, averageRating: (total / ratings.length).toFixed(2) });
  },
  getPostList: async function() {
    const list = await wx.cloud.callFunction({
      name: 'getPostList',
      data: { courseId: this.data.courseId }
    });
    const postList = list.result.data;
    for (let post of postList) {
      post.createdAt = new Date(post.createdAt).toISOString().slice(0, 10);
    }
    this.setData({ postList });
  },

  showRatingForm() {
    this.setData({ showRatingForm: true });
  },
  closeRatingForm() {
    this.setData({ showRatingForm: false });
  },
  changeRating(event) {
    this.setData({ ratingValue: event.detail });
  },
  publishRating: async function() {
    Toast.loading({
      message: '发布中...',
      duration: 0,
      forbidClick: true,
    });
    const res = await wx.cloud.callFunction({
      name: 'publishRating',
      data: {
        courseId: this.data.courseId,
        rating: this.data.ratingValue,
        content: this.data.ratingContent,
        userInfo: this.data.userInfo
      }
    });
    Toast.clear();
    if (res.result) {
      Toast.success('发布评价成功');
      this.getRatingList();
    } else {
      Toast.fail('发布评分失败，请检查网络');
    }
    this.setData({ showRatingForm: false, activeTab: 0 });
  },

  showPostForm() {
    this.setData({ showPostForm: true });
  },
  closePostForm() {
    this.setData({ showPostForm: false });
  },
  uploadPostImage(event) {
    const { postImages } = this.data;
    const newArray = postImages.concat(event.detail.file);
    this.setData({ postImages: newArray });
  },
  deleteImage(event) {
    const { postImages } = this.data;
    postImages.splice(event.detail.index, 1);
    this.setData({ postImages });
  },
  publishPost: async function() {
    Toast.loading({
      message: '发布中...',
      duration: 0,
      forbidClick: true,
    });
    const { postContent, postImages, courseId, userInfo } = this.data;
    if (!postContent) {
      Toast('内容不能为空');
      return;
    }

    const uploadFilePromise = (fileName, chooseResult) => {
      return wx.cloud.uploadFile({
        cloudPath: fileName,
        filePath: chooseResult.url
      });
    }
    const uploadTasks = postImages.map((file, index) => uploadFilePromise(new Date().getTime() + '.png', file));
    const files = await Promise.all(uploadTasks);
    const fileIDs = files.map(item => item.fileID);

    const res = await wx.cloud.callFunction({
      name: 'publishPost',
      data: { courseId, postContent, fileIDs, userInfo }
    });
    Toast.clear();
    if (res.result) {
      Toast.success('发布帖子成功');
      this.getPostList();
    } else {
      Toast.fail('发布帖子失败，请检查网络');
    }
    this.setData({ showPostForm: false, activeTab: 1 });
  },

  previewImage(data) {
    const {images, index } = data.currentTarget.dataset;
    wx.previewImage({
      current: images[index],
      urls: images,
    })
  },
})