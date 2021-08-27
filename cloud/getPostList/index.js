// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let { OPENID, } = cloud.getWXContext();
  const db = cloud.database();
  const _ = db.command;
  const { userId, courseId } = event;
  let condition = { courseId, status: 1 };
  if (userId) condition.userId = _.eq(OPENID);
  return await db.collection('posts').where(condition).orderBy('createdAt', 'desc').get();
}