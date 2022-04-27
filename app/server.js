const log = console.log
const express = require('express')
const exApp = new express() 
const bodyParser = require('body-parser')
const fs = require('fs')
const _ = require('underscore')
const _s = require('underscore.string')
const { v4: uuidv4 } = require('uuid')
const cmd = require('node-cmd')
const path = require('path')

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


let deploy
let deploying = false 

exApp.post('/create', async (req, res) => {
  log('/create')
  deploy = req.body
  deploying = true 
  deployed = false

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

  //'convert' the string back to JS by simply requiring it: 
  deploy = require(modulePath)

  getDeploys() //< refresh deploys in memory

  //send back JS deploy data to client: 
  deployDroplet(deploy, (err, data) => {
    deployed = true
    deploying = false
    log('####### done, deployed! ###########')
  })

  res.send({ deploy, deploying })

})

let terminalOutput = ''
let deployed = false
let envFile, ipAddress

const envPath = path.resolve(process.cwd(), '../deploy-droplet/.env')

const deployDroplet = (deploy, callback) => {
  //write a new .env file: 
  log(envPath)
  envFile = `DROPLET_NAME="coinos-${deploy.SUBDOMAIN}"
SUBDOMAIN="${deploy.SUBDOMAIN}"
HOST_NAME="${deploy.SUBDOMAIN}.coinos.cloud"
REGION_NAME="sfo3"
SIZE_NAME="s-4vcpu-8gb"
IMAGE_NAME="ubuntu-20-04-x64"
USER="node"
PASSWORD="XKArt1Nf31LmqL5a"
SSH_PORT="729"
DROPLET_ID="297238562"
BRANCH_NAME="stageUpdate2"
SSH_KEYS="0d:56:a2:b5:f5:9d:2f:5a:e2:9b:28:f7:72:ae:0a:db"
`
  fs.writeFileSync(envPath, envFile,'utf-8') 

  const processRef = cmd.run('cd ../deploy-droplet; ./deploy-droplet.sh',  
  (err, data, stderr) => {
    if(err) log(err) 
    if(stderr) log(stderr)
    callback(null,data)
  })

  let dataLine = ''

  //listen to the terminal output: 
  processRef.stdout.on('data',
    data => {
      dataLine += data
      if (dataLine[dataLine.length-1] == '\n') {
        console.log(dataLine)
        // parse for IP address:  
        if(!ipAddress && dataLine.search('Droplet IP address') > -1) {
          //update the .env file and run the subdomain script: 
          ipAddress = _s.strRightBack(dataLine, ':').trim()
          envFile = envFile + `IP_ADDRESS="${ipAddress}"`
          fs.writeFileSync(envPath, envFile,'utf-8')
          createSubdomain()
        }
        terminalOutput = terminalOutput + dataLine
      }
    }
  )
}

const trimcate = require('trimcate')

exApp.post('/create/update', (req, res) => {
  res.send({ deploying, deploy, 
    terminalOutput: trimcate(terminalOutput,  { prelude: 36, postlude: 1000 }),
    deployed })
})

const createSubdomain = () => {
  cmd.run('cd ../deploy-droplet; ./create-subdomain.sh',  
  (err, data, stderr) => {
    if(err) log(err) 
    if(stderr) log(stderr)
    log(data)
  })
}