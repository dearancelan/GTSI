// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;
  const db = cloud.database();
  const { userInfo } = event;

  try {
    await db.collection('users').add({ data: { userId: openid, userInfo }});
    return true;
  } catch(e) {
    console.error("createUser failed", e);
    return false;
  }
}