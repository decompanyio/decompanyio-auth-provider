'use strict'

const PORT = 3000
const express = require('express')
const fs = require("fs");
const path = require("path");
const app = express()
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect('/serverless-authentication-gh-pages')
   //res.send('Hello World!')
})

app.get('/callback', (req, res) => {
    console.log('callback query string', req.query)
    let html = getHtml('./public/index.html')
    html = html.replace('<!--##MESSAGE##-->', JSON.stringify(req.query))
    res.send(html)
})

function getHtml(htmlPath){
    let resolvedPath = path.resolve(__dirname, htmlPath);
    
    return fs.readFileSync(resolvedPath, 'utf8');
}  



app.get('/serverless-authentication-gh-pages', (req, res) => {
    console.log(__dirname)
    res.sendFile('/public/index.html', { root: __dirname })
})

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))