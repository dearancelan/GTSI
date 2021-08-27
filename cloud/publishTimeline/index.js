// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const userId = cloud.getWXContext().OPENID;
  const { timelineContent, fileIDs, userInfo } = event;

  const db = cloud.database();
  try {
    await db.collection('timelines').add({
      data: { userId, timelineContent, timelineImages: fileIDs, userInfo, createdAt: new Date().getTime(), status: 1}
    });
    return true;
  } catch(e) {
    console.error("publishTimeline failed", e);
    return false;
  }
}