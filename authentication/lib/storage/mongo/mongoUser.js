const mongojs = require('mongojs')
const db = mongojs(process.env.MONGODB_ENDPOINT)

const USERS_DB_NAME = process.env.USERS_DB_NAME

// empty strings cannot be saved to dynamo
const sanitize = (obj) => {
  const clone = Object.assign({}, obj)
  Object.keys(clone).forEach((key) => {
    if (key === '_raw') {
      clone[key] = sanitize(clone[key])
    } else if (clone[key] === '' || clone[key] === undefined) {
      delete clone[key]
    }
  })
  return clone
}

const saveUser = async (profile) => {
  const params = Object.assign({_id: profile.id, createdAt: new Date()}, sanitize(profile))

  return new Promise((resolve, reject)=>{
    db.collection(USERS_DB_NAME).save(params, (err, data)=>{
      if(err){
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

}

const getUser = async (id) => {
  
  const params = {
    _id: id
  }
  
  return new Promise((resolve, reject)=>{
    db.collection(USERS_DB_NAME).findOne(params, (err, data)=>{
      if(err){
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

module.exports = {
  saveUser,
  getUser
}
