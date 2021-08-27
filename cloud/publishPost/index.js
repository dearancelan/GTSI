// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async (event, context) => {
  const userId = cloud.getWXContext().OPENID;
  const { courseId, postContent, fileIDs, userInfo } = event;

  const db = cloud.database();
  try {
    await db.collection('posts').add({
      data: { courseId, userId, postContent, postImages: fileIDs, userInfo, createdAt: new Date().getTime(), status: 1}
    });
    return true;
  } catch(e) {
    console.error("publishPost failed", e);
    return false;
  }
}