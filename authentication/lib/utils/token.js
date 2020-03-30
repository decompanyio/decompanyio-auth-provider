const AWS = require('aws-sdk')
const kms = new AWS.KMS({region: process.env.REGION})
console.log('process.env.REGION', process.env.REGION)
module.exports.getTokenSecret = async (decodedTokenSecret) => {

  return new Promise((resolve, reject) => {
    const params = {
      CiphertextBlob: decodedTokenSecret
    }

    kms.decrypt(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.Plaintext.toString('utf-8'))
      }
    })
  })
}