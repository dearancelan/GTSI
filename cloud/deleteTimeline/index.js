// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const { _id } = event;

  try {
    return await db.collection('timelines').doc(_id).update({
      data: { status: 0 }
    });
  } catch(e) {
    console.log("delete timeline failed", e);
    return false;
  }
}