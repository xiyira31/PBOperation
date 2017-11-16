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
  },
  savePressure (db, updateDoc, value) {
    db.update(updateDoc, {$push: {data: value}}, {}, function (err) {
      if (err) {
        console.log(err)
      }
    })
  },
  dbCount (db, doc) {
    return new Promise(function (resolve, reject) {
      db.count(doc, function (err, count) {
        if (err) {
          reject(err)
          return
        }
        resolve(count)
      })
    })
  }
}
export default DBUtil
