const log = console.log
const express = require('express')
const exApp = new express() 
const bodyParser = require('body-parser')
const fs = require('fs')
const _ = require('underscore')
const _s = require('underscore.string')
const cmd = require('node-cmd')
const path = require('path')
const truncateMiddle = require('truncate-middle')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const axios = require('axios')
const cheerio = require('cheerio')

//Database:
const PouchDB = require('pouchdb')
const _p = require('underpouch')
const deploysDb = new PouchDB('./db/deploys')
const logsDb = new PouchDB('./db/logs')
const testsDb = new PouchDB('./db/tests')

require('dotenv').config()
const DIGITALOCEAN_SSH_KEYS = process.env.DIGITALOCEAN_SSH_KEYS
if(!DIGITALOCEAN_SSH_KEYS || _.isEmpty(DIGITALOCEAN_SSH_KEYS)) throw 'missing DIGITALOCEAN_SSH_KEYS env var'


const humanDate = date => dayjs(date).format('MMM D [at] HH:mm')

exApp.use(bodyParser.urlencoded({ extended: true }))

exApp.listen(8456, () => 
  log('http://localhost:8456'))


exApp.post('/deploys', async (req, res) => {
  _p.all(deploysDb, (err, deploys) => {
    if(err) { log(err); return res.send(500) }
    log(deploys)
    deploys = _.chain(deploys).map(deploy => {
      if(deploy._id === testingId) deploy.isTesting = true 
      return deploy
    }).sortBy(deploy => deploy.date.created)
    .reverse().value()
    res.send(deploys)
  })
})

// Load index.html into cheerio...
const indexFile = fs.readFileSync( process.cwd() + '/index.html' ) 
const $cj = cheerio.load( indexFile )
// so we can modify the src for main script tag...
$cj('body script').attr('src', '/client-login.bundle.js')
const loginHtml = $cj.html()
// and send on / root request: 
exApp.get('/', (req, res) => res.send( loginHtml ))
//(other routes will use the unmodified index.html )

exApp.post('/coinos-cd-login', (req, res) => {
  log('login attempt')
  //add cookie, etc 
  if(req.body.username === 'satoshi' &&
  req.body.password === '806!c11e9') {
    res.sendStatus(200)
  } else {
    res.sendStatus(401)
  }
})

exApp.use('/', express.static(process.cwd()))

// Protected routes (todo: protect routes): 
const pageRoutes = [
  '/deploys', 
  '/create', 
  '/deploy/:deployId', 
  '/deploy/:deployId/log',
  '/test',
  '/test/result/:testId',
  '/tests'
]
//todo: protect client.bundle.js

exApp.get(pageRoutes, (req, res) => 
  res.sendFile(process.cwd() + '/index.html')
)

exApp.post('/deploy/:deployId', (req, res) => {
  _p.findWhere(deploysDb, { _id : req.params.deployId },
    (err, deploy) => {
      if(err || !deploy) { log(err); return res.sendStatus(500) }
      deploy.date.ago = dayjs(deploy.date.created).fromNow()
      deploy.date.human = humanDate(deploy.date.created)
      res.send(deploy)
    })
})

exApp.post('/deploy/:deployId/is-online', async (req, res) => {
  const deploy = await deploysDb.get(req.params.deployId)
  log(deploy)

  const url = `https://${deploy.HOST_NAME}`

  let getUrl
  try {
    getUrl = await axios.get(url)
  } catch (err) {
    res.sendStatus(err.response.status)
  }
  if(!getUrl) return 
  
  log('got the URL')
  return res.sendStatus(200)
})

exApp.post('/deploy/:deployId/destroy', async (req, res) => {

  cmd.run('cd ../deploy-droplet; ./destroy-droplet.sh',  
  async (err, data, stderr) => {
    if(err) {
      log('err: ' + err) 
      log('stderr:' + stderr )
      return res.sendStatus(500)
    }
    if(_.isEmpty(data)) return res.sendStatus(500)
    log(data)

    //now delete the deploy doc: 
    try {
      const deploy = await deploysDb.get(req.params.deployId)
      const removed = await deploysDb.remove(deploy)
      log(removed)
      //remove all the tests in the DB for this one 
    } catch (e) {
      log(e) 
    }

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

const saveDeploy = theDeploy => {
  //use global if no deploy supplied: 
  if(!theDeploy) theDeploy = deploy
  if(!theDeploy) throw 'no deploy to save'
  _p.replace(deploysDb, theDeploy, (err, res) => {
    if(err) { log(err) } 
    else {
      theDeploy._id = res._id 
      theDeploy._rev = res._rev
      log('updated deploy doc in DB ok')
    }
  })
}


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
        dataLine = ''
      }
    }
  )
}

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

exApp.post('/deploy/:deployId/log', (req, res) => {
  _p.findWhere(logsDb, {
    deploy_id : req.params.deployId
  }, (err, doc) => {
    if(err) { log(err); return res.sendStatus(500) }
    res.send(doc)
  })
})

exApp.post('/deploy/:deployId/dismiss', (req, res)  => {
  log('dismiss deploy')
  deploy = null
  deploying = false 
  deployed = null 
  terminalOutput = ''
  res.sendStatus(200)
})

let testing = false 
let testResult
let testOutput = ''
let tested
let testProcess
let testingId 

exApp.get('/test/:deployId', (req, res) => {
  if(testing || tested ) {
    return res.sendFile(process.cwd() + '/index.html')
  }
  _p.findWhere(deploysDb, { _id : req.params.deployId },
  (err, deploy) => {
    if(err) { throw err }

      let baseUrl = `https://${deploy.SUBDOMAIN}.coinos.cloud/`
      if(deploy.HOST_NAME === 'coinos.io') {
        baseUrl = 'https://coinos.io/'
      }
    
      testing = true 
      testingId = deploy._id 
      let passed = true 
      testProcess = cmd.run(`cd ../../coinos-tests; export BASE_URL=${baseUrl}; npm run test-headless`,
        async (err, data, stderr) => {
          log('### test complete! ### ')
          testing = false
          tested = true
          testingId = null 
          if(err) {
            log('err: ' + err) 
            log('stderr:' + stderr )
            testProcess = null 
            passed = false 
          }
          testOutput = data
          if(_.isEmpty(data)) return res.sendStatus(500)
          testResult = true
          testProcess = null 
          log('post test result to db...')
          const now = Date.now()
          const dbPost = await testsDb.post({
            deploy_id : deploy._id, 
            result : data,
            date : now, 
            passed
          })
          log(dbPost)
          deploy.lastTest = {
            date : now,
            test_id : dbPost.id,
            passed
          }
          saveDeploy(deploy) 
        }
      )
      
      let dataLine = ''
      testProcess.stdout.on('data',
        data => {
          dataLine += data
          if (dataLine[dataLine.length-1] == '\n') {
            console.log(dataLine)
            testOutput = `${testOutput}${dataLine}`
            dataLine = ''
          }
        }
      )
    
      res.sendFile(process.cwd() + '/index.html')
  })
})

//send back the status of the currently running test: 
exApp.post('/test/update', (req, res) => {
  res.send({ testing, testOutput, testResult, testingId })
})

exApp.post('/test/:deployId/dismiss', (req, res)  => {
  log('dismiss test')
  testing = false 
  tested = false 
  testResult = null 
  testOutput = ''
  testingId = null 
  if(testProcess) {
    log('testProcess.pid: ')
    log(testProcess.pid)
    process.kill(testProcess.pid, 'SIGKILL')
    //testProcess.kill('SIGKILL')
    testProcess = null
  }
  res.sendStatus(200)
})

exApp.post('/test/:deployId/history', (req, res) => {
  _p.where(testsDb, {
    deploy_id : req.params.deployId
  }, (err, tests) => {
    if(err) { throw err }
    //history need only be a summary (just dates and ids): 
    tests = _.chain(tests).map(test => {
      return {
        date : test.date, 
        dateHuman : humanDate(test.date), 
        ago : dayjs(test.date).fromNow(), 
        _id : test._id, 
        passed : test.passed 
      }   
    }).sortBy(test => test.date )
    .value().reverse() 
    
    res.send(tests)
  })
})

exApp.post('/test/result/:testId', async (req, res) => {
  const test = await testsDb.get(req.params.testId)
  const deploy = await deploysDb.get(test.deploy_id)
  test.ago = dayjs(test.date).fromNow()
  test.dateHuman = dayjs(test.date).format('MMM D [at] HH:mm')
  res.send({test, deploy})
})

exApp.post('/tests', async (req, res) => {
  await deleteOrphanTests() 
  _p.all(testsDb, (err, tests) => {
    if(err) throw err
    tests = _.chain(tests).map(test => {
      test.dateHuman = dayjs(test.date).format('MMM D [at] HH:mm')
      test.dateAgo = dayjs(test.date).fromNow()
      return test 
    }).sortBy(test => test.date )
    .value().reverse() 

    //also check if we are currently doing a test... 
    if(testing) tests.unshift({
      testing : true, 
      deploy_id : testingId 
    })

    res.send(tests)
  })
})

const deleteOrphanTests = () => {
  return new Promise(resolve => {

    _p.all(deploysDb, (err, deploys) => {
      if(err | !deploys) { throw 'err or no deploys found' }

      _p.all(testsDb, async (err, tests) => {
        if(err | !tests) { throw 'err or no tests found' }

        for (const test of tests) {
          let matchingDeploy = _.findWhere(deploys, {
            _id : test.deploy_id
          })
          if(!matchingDeploy) {
            log('removing a test...')
            const removeResult = await testsDb.remove(test)
            log(removeResult)
          }
        }
        resolve()
      })
    })
  })
}

exApp.post('/delete-orphan-tests', async (req, res) => {
  try {
    await deleteOrphanTests()
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})

//todo: delete orphan Deploys; ie- Droplets that can not be found 
//in Digital Ocean 

const deleteDeployDoc = docId =>   
  new Promise(async resolve => {
    try {
      const deployDoc = await deploysDb.get(docId)
      await deploysDb.remove(deployDoc)
      resolve()
    } catch(err) { throw err }
  })

exApp.post('/delete-deploy-doc/:deployId', async (req, res) => {
  try {
    await deleteDeployDoc(req.params.deployId)
    res.sendStatus(200)
  } catch(err) { res.sendStatus(500)}
})