const log = console.log
const express = require('express')
const exApp = new express() 
const fs = require('fs')
const _ = require('underscore')

exApp.use('/', express.static(process.cwd()))

exApp.listen(8456, () => 
  log('http://localhost:8456'))

let deploys = [] 

//scoop up any existing deploys... 
const dirContents = fs.readdirSync(process.cwd() + '/data')

dirContents.forEach( deployFile => {
  const deploy = require('./data/' + deployFile)
  deploys.push(deploy)
})

exApp.get('/deploys', (req, res) => {
  res.send(deploys)
})

exApp.get('/deploy/:deployId', (req, res) => 
  res.sendFile(process.cwd() + '/deploy.html')
)

exApp.post('/deploy/:deployId', (req, res) => {
  const deploy = _.findWhere(deploys, { _id : req.params.deployId })
  if(!deploy) return res.sendStatus(500)
  res.send(deploy)
})

exApp.post('/deploy/:deployId/destroy', (req, res) => {
  const deploy = _.findWhere(deploys, { _id : req.params.deployId })
  const fileName = `${deploy.SUBDOMAIN}_${deploy._id}.js`
  log(`${process.cwd()}/data/${fileName}` )
  //remove from fs: 
  fs.unlinkSync(`${process.cwd()}/data/${fileName}`)
  //remove from memory: 
  deploys = _.without(deploys, deploy)
  //send back ok status: 
  res.sendStatus(200)
})