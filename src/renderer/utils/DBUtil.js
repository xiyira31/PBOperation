import { DBName, InitDB } from './InitDB'
const DBUtil = {
  init (db) {
    db.find({name: DBName}, function (err, docs) {
      if (err) {
        console.log(err)
        return
      }
      if (docs.length === 0) {
        db.insert(InitDB, function (err) {
          if (err) {
            console.log(err)
          }
        })
      }
    })
  },
  updateSetting (db, setting) {
    db.update({name: DBName}, {$set: setting}, {}, function (err) {
      if (err) {
        console.log(err)
      }
    })
  }
}
export default DBUtil
