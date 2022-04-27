const log = console.log
const express = require('express')
const exApp = new express() 
const bodyParser = require('body-parser')
const fs = require('fs')
const _ = require('underscore')
const { v4: uuidv4 } = require('uuid')

exApp.use(bodyParser.urlencoded({ extended: true }))
exApp.use('/', express.static(process.cwd()))

exApp.listen(8456, () => 
  log('http://localhost:8456'))

let deploys = [] 

const getDeploys = () => {
  //scoop up any existing deploys... 
  const dirContents = fs.readdirSync(process.cwd() + '/data')

  dirContents.forEach( deployFile => {
    const deploy = require('./data/' + deployFile)
    deploys.push(deploy)
  })
  deploys = _.unique(deploys)
}

exApp.get('/deploys', (req, res) => {
  getDeploys()
  res.send(deploys)
})

// Routes: 
const pageRoutes = [
  '/', 
  '/create', 
  '/deploy/:deployId', 
]

exApp.get(pageRoutes, (req, res) => 
  res.sendFile(process.cwd() + '/index.html')
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


const delay = async (seconds) =>
  await new Promise((r) => setTimeout(r, seconds ? seconds * 1000 : 1000))


exApp.post('/create', async (req, res) => {
  log('/create')
  let deploy = req.body

  const id = uuidv4()
  const fileName = `${deploy.SUBDOMAIN}_${id}.js`

  //create a new deployment.... 
  //metadata file: 
  const modulePath = process.cwd() + `/data/${fileName}`
  fs.writeFileSync(modulePath,
`module.exports = {
  _id : '${id}',
  date : {
    created : ${Date.now()},
  }, 
  host: 'Digital Ocean', 
  DROPLET_NAME : "coinos-${deploy.SUBDOMAIN}",
  SUBDOMAIN:"${deploy.SUBDOMAIN}", 
  HOST_NAME:"${deploy.SUBDOMAIN}.coinos.cloud",
  REGION_NAME:"sfo3",
  SIZE_NAME:"s-4vcpu-8gb",
  IMAGE_NAME:"ubuntu-20-04-x64", 
  USER:"node", 
  PASSWORD:"XKArt1Nf31LmqL5a", 
  SSH_PORT:"729", 
  DROPLET_ID:"297238562", 
  BRANCH_NAME:"stageUpdate2", 
}`,
  'utf-8')

  //todo: kickoff the actual deploy script..
  await delay(3) //< (for now mock it)
  
  //'convert' the string back to JS by simply requiring it: 
  deploy = require(modulePath)

  getDeploys() //< refresh deploys in memory

  //send back JS deploy data to client: 
  res.send(deploy)
})