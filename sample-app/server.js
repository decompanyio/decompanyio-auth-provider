'use strict'

const PORT = 3000
const express = require('express')
const app = express()
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect('/serverless-authentication-gh-pages')
   //res.send('Hello World!')
})

app.get('/callback', (req, res) => {
    res.sendFile('/public/index.html', { root: __dirname })
})



app.get('/serverless-authentication-gh-pages', (req, res) => {
    console.log(__dirname)
    res.sendFile('/public/index.html', { root: __dirname })
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))