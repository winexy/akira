const fetch = require('node-fetch')
const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const webhook = core.getInput('webhook')

    await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks: getBlocks(),
      }),
    })

    core.debug('message sent')
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }

  function getBlocks() {
    const message = core.getInput('message')
    const {context} = github

    return [
      {
        type: 'section',
        text: md(message),
      },
      {
        type: 'section',
        fields: [
          info('Repository', context.repo.repo),
          info('Event', context.eventName),
          info('SHA', context.sha),
          info('Ref', context.ref),
        ],
      },
    ]

    function info(label, value) {
      return md(`*${label}:*\n${value}`)
    }

    function md(text) {
      return {
        type: 'mrkdwn',
        text,
      }
    }
  }
}

run()
