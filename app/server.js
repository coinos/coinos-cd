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
const deploysDb = new PouchDB('./db/deploys')
const logsDb = new PouchDB('./db/logs')

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
  try {
    const deploy = await deploysDb.get(req.params.deployId)
    const removed = await deploysDb.remove(deploy)
    log(removed)
  } catch (e) {
    log(e) 
  }

  const processRef = cmd.run('cd ../deploy-droplet; ./destroy-droplet.sh',  
  (err, data, stderr) => {
    if(err || stderr) {
      log('err: ' + err) 
      log('stderr:' + stderr )
      return res.sendStatus(500)
    }
    if(_.isEmpty(data)) return res.sendStatus(500)
    log(data)
    res.sendStatus(200)
  })

})


let deploy
let deploying = false 

exApp.post('/create', async (req, res) => {
  log('/create')
  deploying = true 
  deployed = false

  deploy = {
    deploying, 
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
    BRANCH_NAME:"stageUpdate2", 
  }

  //create a new deployment.... 
  const postDeploy = await deploysDb.post(deploy)
  log(postDeploy)
  deploy._id = postDeploy.id
  deploy._rev = postDeploy.rev

  //send back JS deploy data to client: 
  deployDroplet(deploy, async (err, data) => {
    log('####### done! ###########')
    if(err) {
      log('####### deploy err :/ ###########')
      log(err)
      deployError = true 
      deploying = false
      deploy.deploying = false 
    } else {
      log('####### deployed OK! ###########')
      deployed = true
      deploying = false
      deploy.deploying = false 
      saveDeploy()
    }
    const logPost = await logsDb.post({
      deploy_id : deploy._id, 
      log : data 
    })
    log(logPost)
  })

  res.send({ deploy, deploying })
})

let terminalOutput = ''
let deployed = false
let envFile

const envPath = path.resolve(process.cwd(), '../deploy-droplet/.env')

const saveDeploy = () => 
  _p.replace(deploysDb, deploy, (err, res) => {
    if(err) { log(err) } 
    else {
      deploy._id = res._id 
      deploy._rev = res._rev
      log('updated deploy doc in DB ok')
    }
  })


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
BRANCH_NAME="stageUpdate2"
SSH_KEYS="${process.env.DIGITALOCEAN_SSH_KEYS}"
`
  fs.writeFileSync(envPath, envFile,'utf-8') 

  const processRef = cmd.run('cd ../deploy-droplet; ./deploy-droplet.sh',  
  (err, data, stderr) => {
    if(err) {
      log('$$$$$$$$$$$ err: $$$$$$$$$$$$$$$$' + err) 
      return callback(true)
    }
    callback(null,data)
  })

  let dataLine = ''
  let ipAddress = dropletId = false 
  //listen to the terminal output: 
  processRef.stdout.on('data',
    data => {
      dataLine += data
      if (dataLine[dataLine.length-1] == '\n') {
        console.log(dataLine)
        // parse for IP address:  
        if(!ipAddress && dataLine.search('Droplet IP address') > -1) {
          ipAddress = true 
          //update the .env file and run the subdomain script: 
          deploy.IP_ADDRESS = _s.strRightBack(dataLine, 'Droplet IP address:').trim()
          //check the string is actually an IP address and throw err if not;  Droplet limit for example can bump into this issue
          if(_.isEmpty(deploy.IP_ADDRESS)) {
            ipAddress = false
            return terminalOutput = `${terminalOutput}\n${dataLine}`
          }
          log(`$$$$$$$$$$ update deploy.IP_ADDRESS to ${deploy.IP_ADDRESS} $$$$$$$$$$$`)
          envFile = envFile + `
IP_ADDRESS="${deploy.IP_ADDRESS}"`
          fs.writeFileSync(envPath, envFile,'utf-8')
          createSubdomain() 
          //update value in db: 
          saveDeploy()
        } else if(!dropletId && dataLine.search('coinos-') > -1) {
          dropletId = true
          //Droplet ID is avail, but we will run this command to get a more precise value: 
          cmd.run(`doctl compute droplet get ${deploy.DROPLET_NAME} --no-header`,
          (err, doctlData, stderr) => {
            if(err) log(err) 
            if(stderr) log(stderr)
            deploy.DROPLET_ID = _s.strLeft(doctlData, 'coinos-').trim()
            log(`$$$$$$$$$$ update deploy.DROPLET_ID to ${deploy.DROPLET_ID} $$$$$$$$$$$`)
            envFile = envFile + `
DROPLET_ID="${deploy.DROPLET_ID}"`
            fs.writeFileSync(envPath, envFile,'utf-8')
            saveDeploy()
          })
        }
        terminalOutput = `${terminalOutput}\n${dataLine}`
      }
    }
  )
}

const truncateMiddle = require('truncate-middle')

exApp.post('/create/update', (req, res) => {
  res.send({ deploying, deploy, 
    terminalOutput: truncateMiddle(terminalOutput, 0, 1200, '\n'),
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