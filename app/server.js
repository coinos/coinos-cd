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

//Database:
const PouchDB = require('pouchdb')
const _p = require('underpouch')
const deploysDb = new PouchDB('./db')

require('dotenv').config()
const DIGITALOCEAN_SSH_KEYS = process.env.DIGITALOCEAN_SSH_KEYS
if(!DIGITALOCEAN_SSH_KEYS || _.isEmpty(DIGITALOCEAN_SSH_KEYS)) throw 'missing DIGITALOCEAN_SSH_KEYS env var'

exApp.use(bodyParser.urlencoded({ extended: true }))
exApp.use('/', express.static(process.cwd()))

exApp.listen(8456, () => 
  log('http://localhost:8456'))


exApp.get('/deploys', async (req, res) => {
  _p.all(deploysDb, (err, deploys) => {
    if(err) { log(err); return res.send(500) }
    log(deploys)
    res.send(deploys)
  })
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
  _p.findWhere(deploysDb, { _id : req.params.deployId },
    (err, deploy) => {
      if(err) { log(err); return res.sendStatus(500) }
      res.send(deploy)
    })
})

exApp.post('/deploy/:deployId/destroy', async (req, res) => {
  const deploy = await deploysDb.get(req.params.deployId)
  const removed = await deploysDb.remove(deploy)
  log(removed)
  res.sendStatus(200)
})


let deploy
let deploying = false 

exApp.post('/create', async (req, res) => {
  log('/create')
  deploying = true 
  deployed = false

  deploy = {
    date : {
      created : Date.now() 
    },
    host: 'Digital Ocean',
    DROPLET_NAME : `coinos-${req.body.SUBDOMAIN}`,
    SUBDOMAIN:`${req.body.SUBDOMAIN}`, 
    HOST_NAME:`${req.body.SUBDOMAIN}.coinos.cloud`,
    REGION_NAME:"sfo3",
    SIZE_NAME:"s-4vcpu-8gb",
    IMAGE_NAME:"ubuntu-20-04-x64", 
    USER:"node", 
    PASSWORD:"XKArt1Nf31LmqL5a", 
    SSH_PORT:"729", 
    DROPLET_ID:"297238562", 
    BRANCH_NAME:"stageUpdate2", 
  }

  //create a new deployment.... 
  const postDeploy = await deploysDb.post(deploy)
  log(postDeploy)
  deploy._id = postDeploy.id
  deploy._rev = postDeploy.rev

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
SSH_KEYS="${process.env.DIGITALOCEAN_SSH_KEYS}"
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
          log('ipAddress: ' + ipAddress)
          envFile = envFile + `IP_ADDRESS="${ipAddress}"`
          fs.writeFileSync(envPath, envFile,'utf-8')
          createSubdomain()
          deploy.IP_ADDRESS = ipAddress
          //update value in db: 
          _p.replace(deploysDb, deploy, (err, res) => {
            if(err) { log(err) } 
            else {
              log('updated deploy doc in DB ok')
            }
          })
        }
        terminalOutput = `${terminalOutput}\n${dataLine}`
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