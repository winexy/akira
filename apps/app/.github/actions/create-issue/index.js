const core = require('@actions/core')
const github = require('@actions/github')

function parseAssignees(input) {
  return input ? input.split('\n') : undefined
}

try {
  const token = core.getInput('token')
  const title = core.getInput('title')
  const body = core.getInput('body')
  const assignees = parseAssignees(core.getInput('assignees'))

  const octokit = new github.getOctokit(token)
  const {owner, repo} = github.context

  const response = octokit.issues.create({
    owner,
    repo,
    title,
    body,
    assignees
  })

  core.setOutput('issue', JSON.stringify(response.data))
} catch (error) {
  core.setFailed(error.message)
}
