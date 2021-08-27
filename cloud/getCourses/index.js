// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const $ = db.command.aggregate;

  const res = await db.collection('courses')
  .aggregate()
  .group({
    _id: '$major',
    courses: $.push({
      courseId: '$_id',
      title: '$title',
      code: '$code',
    })
  }).sort({_id: 1}).end();

  return res;
}