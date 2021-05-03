const http = require('http')
const core = require('@actions/core')

async function run() {
  const message = core.getInput('message')
  const webhook = core.getInput('webhook')

  const res = http.request(
    webhook,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: message
      })
    },
    res => {
      res.on('end', () => {
        core.debug(`Status code: ${res.statusCode}`)
        global.console.log('Message sent')
      })
    }
  )

  res.on('error', error => {
    core.error(error)
    core.setFailed(error.message)
  })
}

run()
