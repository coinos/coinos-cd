const log = console.log
const express = require('express')
const exApp = new express() 
const fs = require('fs')

exApp.use('/', express.static(process.cwd()))

exApp.listen(8456, () => 
  log('http://localhost:8456'))

exApp.get('/deploys', (req, res) => {
  const deploys = [] 

  //scoop up any existing deploys... 
  const dirContents = fs.readdirSync(process.cwd() + '/data')

  dirContents.forEach( deployFile => {
    const deploy = require('./data/' + deployFile)
    deploys.push(deploy)
  })

  res.send(deploys)
})