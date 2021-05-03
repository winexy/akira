const core = require('@actions/core')
const github = require('@actions/github')

function parseAssignees(input) {
  return input ? input.split('\n') : undefined
}

async function run() {
  try {
    const token = core.getInput('token')
    const title = core.getInput('title')
    const body = core.getInput('body')
    const assignees = parseAssignees(core.getInput('assignees'))

    const octokit = github.getOctokit(token)
    const {context} = github.context

    const response = await octokit.issues.create({
      ...context.repo,
      title,
      body,
      assignees
    })

    core.setOutput('issue', JSON.stringify(response.data))
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

run()
