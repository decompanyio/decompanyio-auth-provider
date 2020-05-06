const mongojs = require('mongojs')
const db = mongojs(process.env.MONGODB_ENDPOINT)
const crypto = require('crypto')
const Promise = require('bluebird')

const CACHE_DB_NAME = process.env.CACHE_DB_NAME

function hash() {
  return crypto.randomBytes(48).toString('hex')
}

const sanitize = (obj) => {
  const clone = Object.assign({}, obj)
  Object.keys(clone).forEach((key) => {
    if (typeof(key) === 'object') {
      clone[key] = sanitize(clone[key])
    } else if (clone[key] === '' || clone[key] === undefined || clone[key] === null) {
      delete clone[key]
    }
  })
  return clone
}

/**
 * Creates OAuth State
 */
const createState = async (opts) => {
  const state = hash()
  const params = Object.assign({
    _id: {
      token: state,
      type: 'STATE',
    },
    expired: false
  }, { opts: sanitize(opts) })

  return new Promise((resolve, reject)=>{
    db.collection(CACHE_DB_NAME).save(params, (err, data)=>{
      if(err){
        reject(err)
      } else {
        resolve(state)
      }
    })
  })

}

/**
 * Revokes OAuth State
 * @param state
 */
const revokeState = async (state) => new Promise((resolve, reject) => {
  const queryToken = async () => {
    const params = {
      _id: {
        token: state,
        type: 'STATE'
      }
    }

    return new Promise((resolve, reject)=>{
      db.collection(CACHE_DB_NAME).findOne(params, (err, data)=>{
        if(err){
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  const insertToken = async (data) => {
    
    const item = data
    if (item.expired) {
      throw new Error('State expired')
    } else {
      const params = {
        _id: {
          token: state,
          type: 'STATE'
        },
        expired: true
      }

      return new Promise((resolve, reject)=>{
        db.collection(CACHE_DB_NAME).save(params, (err, data)=>{
          if(err){
            reject(err)
          } else {
            resolve(Object.assign(data._id, data))
          }
        })
      })
    }
  }

  queryToken()
    .then(insertToken)
    .then((item) => {
      const {token} = item
      if (state !== token) {
        reject(new Error('State mismatch'))
      }
      resolve(item)
    })
    .catch(reject)
})

/**
 * Creates and saves refresh token
 * @param user
 */
const saveRefreshToken = async (user, payload) => {
  const token = hash()
  const params = {
    _id: {
      token,
      type: 'REFRESH'
    },
    expired: false,
    userId: user,
    payload: JSON.stringify(payload || {}),
    createdAt: new Date()
  }

  return new Promise((resolve, reject)=>{
    db.collection(CACHE_DB_NAME).save(params, (err, data)=>{
      if(err){
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}

/**
 * Revokes old refresh token and creates new
 * @param oldToken
 */
const revokeRefreshToken = async (oldToken) => new Promise((resolve, reject) => {
  if (oldToken.match(/[A-Fa-f0-9]{64}/)) {
    const token = hash()

    const queryToken = () => {

      const params = {
        _id: {
          token: oldToken,
          type: 'REFRESH'
        }
      }
      console.log('query Token', params)
      return new Promise((resolve, reject)=>{
        db.collection(CACHE_DB_NAME).findOne(params, {
          token: 1,
          type: 1,
          userId: 1,
          payload: 1
        },(err, data)=>{
          if(err){
            reject(err)
          } else {
            console.log('query token', data)
            resolve(data)
          }
        })
      })
    }

    const newRefreshToken = async (data) => {
      console.log('newRefreshToken', data)
      const { userId, payload } = data

      const params = {
        _id: {
          token,
          type: 'REFRESH'
        },
        expired: false,
        userId,
        payload,
        createdAt: new Date()
      }
      return new Promise((resolve, reject)=>{
        db.collection(CACHE_DB_NAME).save(params, (err, data)=>{
          if(err){
            reject(err)
          } else {
            resolve(userId)
          }
        })
      })
    }

    const expireRefreshToken = async (userId) => {
      const params = {
        _id: {
          token: oldToken,
          type: 'REFRESH'
        },
        expired: true,
        userId
      }

      return new Promise((resolve, reject)=>{
        db.collection(CACHE_DB_NAME).save(params, (err, data)=>{
          if(err){
            reject(err)
          } else {
            resolve(userId)
          }
        })
      })
    }

    queryToken().then((data) =>
      newRefreshToken(data)
        .then(expireRefreshToken)
        .then((id) => resolve({
          id,
          token,
          payload: data.payload && JSON.parse(data.payload)
        })))
      .catch(reject)
  } else {
    reject(new Error('Invalid token'))
  }
})

module.exports = {
  createState,
  revokeState,
  saveRefreshToken,
  revokeRefreshToken
}
