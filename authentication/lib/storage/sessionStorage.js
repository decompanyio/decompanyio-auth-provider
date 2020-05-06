

  'use strict';
const { customAlphabet } = require('nanoid')
const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 11);
const crypto = require('crypto');
const redisSession = require('./redis/redisSession')
const SESSION_ID = process.env.SESSION_ID
const cookieUtil = require('cookie');
const SESSION_TIMEOUT = 60 * 60 * 24 * 90 //90일 서버 세션 만료일(SEC)


const getSession = async (cookie) => {

    return new Promise(async (resolve, reject) => {
    
        let id;
        if(cookie && cookie[SESSION_ID]){
            id = cookie[SESSION_ID]
        } 

        if(!id || id === 'undefined' || id === 'null') {
          id = await generateSessionId()
        }
        
        let session = await redisSession.get(id)
        //console.log('get session', id, session)

        if(!session){
            session = JSON.stringify({
              id: id,
              created: Date.now()
            })
            await redisSession.set(id, session)
        }

        resolve(typeof(session) === 'string'?JSON.parse(session):session)
      
    })
  }

const setSession = async (key, session) => {

  return new Promise((resolve, reject) => {
    let sessionKey = key
    if(typeof(key) === 'object'){
      sessionKey = cookie[SESSION_ID]
    } 

    redisSession.set(sessionKey, session, SESSION_TIMEOUT)      
    .then(resolve)
    .catch(reject)
  })
}

  
const isSignined = (session) => {

  return session.userId && session.id && session.email && session.isSigned === true && !isNaN(session.signed);
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

module.exports = {
  getSession,
  setSession,
  isSignined,
  //generateSessionId
}