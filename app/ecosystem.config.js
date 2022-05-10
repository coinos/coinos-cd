const ecosystem = { apps: [] }
const apps = ecosystem.apps

apps.push({
  name: 'coinos-cd-app',
  script: './server.js',
  log : './app.log',
})

module.exports = ecosystem