

  'use strict';
const { customAlphabet } = require('nanoid')
const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 11);
const crypto = require('crypto');
const redisSession = require('./redis/redisSession')
const SESSION_ID = process.env.SESSION_ID
const cookieUtil = require('cookie');
const SESSION_TIMEOUT = Number(process.env.SESSION_TIMEOUT)


const getSession = async (id) => {

  return new Promise(async (resolve, reject) => {
  
    try{
      if(!id || id ==='' || id === 'undefined' || id === 'null') {
        id = await generateSessionId()
      }
      
      let session = await redisSession.get(id)
      const touch = await redisSession.touch(id)
      const ttl = await redisSession.ttl(id)
      console.log('get session', session, touch, ttl)
  
      if(!session){
          session = JSON.stringify({
            id: id,
            created: Date.now()
          })
          await redisSession.set(id, session, Number(SESSION_TIMEOUT))
      }
  
      resolve(typeof(session) === 'string'?JSON.parse(session):session)
    } catch(err){
      reject(err)
    }
    
  })
}

const setSession = async (key, session) => {

  return new Promise((resolve, reject) => {
    let sessionKey = key
    if(typeof(key) === 'object'){
      sessionKey = cookie[SESSION_ID]
    } 

    redisSession.set(sessionKey, session, Number(SESSION_TIMEOUT))      
    .then(resolve)
    .catch(reject)
  })
}

  
const isSignined = (session) => {

  return session.userId && session.userId.startsWith('ps-auth2|') && session.id && session.email && session.isSigned === true;
}

async function generateSessionId (cnt) {
  return new Promise((resolve, reject)=>{
    const id = crypto.createHash('sha512').update(createId()).digest('base64') 

    redisSession.get(id)
    .then((savedSession)=>{
      if(savedSession){
        const c = !isNaN(cnt)?cnt + 1:0;
        return generateSessionId(c)
      } else {
        resolve(id)
      }
    })
    .catch((err)=>reject)
    
  })
  
}

const removeSession = (id) => {
  return new Promise((resolve, reject) => {
    redisSession.del(id)
    .then(resolve)
    .catch(reject)
  })
}

const revokeSession = (id) => {
  return new Promise((resolve, reject) => {
    getSession(id)
    .then(removeSession(id))
    .then((r)=>{
      return getSession()
    })
    .then(resolve)
    .catch(reject)
  })
}

module.exports = {
  getSession,
  setSession,
  removeSession,
  revokeSession,
  isSignined
}