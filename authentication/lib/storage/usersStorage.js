

// Common
const Promise = require('bluebird')

const cognitoUser = require('./cognito/cognitoUser')
const dynamoUser = require('./dynamo/dynamoUser')
const faunaUser = require('./fauna/faunaUser')
const mongoUser = require('./mongo/mongoUser')

const saveUser = async (profile) => {
  if (!profile) {
    return Promise.reject(new Error('Invalid profile'))
  }

  return new Promise((resolve, reject)=>{
    let user
    mongoUser.getUser(profile.id)
    .then((data)=>{
      if(!data || !data._id){
        user = mongoUser.saveUser(profile)
      } else {
        user = data
      }
      resolve(user)
    })
    .catch((err)=>{
      reject(err)
    })
  });
}

const getUser = async (id) => {
  if (!id) {
    return Promise.reject(new Error('Invalid id'))
  }

  return mongoUser.getUser(id)
}

const getUserProviderEmail = async (email) => {
  if (!email) {
    return Promise.reject(new Error('Invalid email'))
  }

  return mongoUser.getUserProviderEmail(email)
}

module.exports = {
  saveUser,
  getUser,
  getUserProviderEmail
}
