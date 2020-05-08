const Redis = require('ioredis');

const REDIS_CACHE_ENDPOINT = process.env.REDIS_CACHE_ENDPOINT;
const REDIS_CACHE_PORT = process.env.REDIS_CACHE_PORT;
const REDIS_CACHE_DB = process.env.REDIS_CACHE_DB;

const redisCache = new Redis({
  port: REDIS_CACHE_PORT,   // Redis port
  host: REDIS_CACHE_ENDPOINT,   // Redis host
  db: !isNaN(REDIS_CACHE_DB)?REDIS_CACHE_DB:0
});

async function get(key) {
  return new Promise((resolve, reject)=>{
    redisCache.get(key, (err, data)=>{
      if(err){
        reject(err)
      } else {
        resolve(data)
      }
    })
  }) 
}

async function set(key, data, expireAtSec) {
  return new Promise((resolve, reject)=>{
    if(!key || !data){
      reject(new Error("args is invaild.."))
    }
    const strData = typeof(data) === 'string'?data:JSON.stringify(data)

    //console.log('set session in redis', key, data, expireAtSec)
    if(!isNaN(expireAtSec) && expireAtSec > 0){
      redisCache.set(key, strData, "EX", expireAtSec, (err, res)=>{
          if(err){
            reject(err)
          } else {
            resolve(res)
          }
        })
        console.log("expired at caching : " + key, expireAtSec)
    } else {
      redisCache.set(key, strData, (err, res) => {
          if(err){
            reject(err)
          } else {
            console.log("Immortal caching : " + key, expireAtSec)
            resolve(res)
          }
        })
    }
    
  })
}

async function del(key){

  return new Promise((resolve, reject)=>{
    redisCache.del(key, (err, res)=>{
      if(err){
        reject(err)
      } else {
        resolve(res)
      }
    });
  })
}

async function touch(key){

  return new Promise((resolve, reject)=>{

    if(!redisCache.touch) {

      redisCache.defineCommand('touch', {
        numberOfKeys: 1,
        lua: 'return KEYS[1]'
      });
    }
    
  
    redisCache.touch(key, (err, data)=>{
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
      
    })
  })
  
}

async function expire(key, expireSec){
  
  return new Promise((resolve, reject)=>{

    if(!redisCache.expire) {

      redisCache.defineCommand('expire', {
        numberOfKeys: 1,
        lua: 'return KEYS[1] ARGV[1]'
      });
    }
    
  
    redisCache.expire(key, expireSec, (err, data)=>{
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
      
    })
  })
    
}


async function ttl(key){
  
  return new Promise((resolve, reject)=>{

    if(!redisCache.ttl) {
      redisCache.defineCommand('ttl', {
        numberOfKeys: 1,
        lua: 'return KEYS[1]'
      });
    }
    
    redisCache.ttl(key, (err, data)=>{
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
      
    })
  })
    
}

module.exports = {
    set,
    get,
    del,
    touch,
    expire,
    ttl
}