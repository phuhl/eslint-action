const request = require('./request')
const { execSync } = require('child_process');
const github = require('@actions/github');

const { GITHUB_SHA, GITHUB_EVENT_PATH, GITHUB_TOKEN, GITHUB_WORKSPACE } = process.env
const owner = github.context.repo.owner
const repo = github.context.repo.repo
const ctx = github.context;
const checkName = 'ESLint check'


function getPrNumber() {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

async function getChangedFiles(client, prNumber) {
  const listFilesResponse = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber
  });

  const changedFiles = listFilesResponse.data.map(f => f.filename);

  console.log('found changed files:');
  for (const file of changedFiles) {
    console.log('  ' + file);
  }

  return changedFiles;
}
async function createCheck(client) {
   const check = await client.checks.create({
        owner: ctx.repo.owner,
        repo: ctx.repo.repo,
        name: checkName,
        head_sha: ctx.sha,
        status: "in_progress",
    });
  
   return check.data.id
}

async function eslint(client) {
  const eslint = require('eslint')
  const files = await getChangedFiles(client, getPrNumber())
  const cli = new eslint.CLIEngine()
  const report = cli.executeOnFiles(files) 
  const { results, errorCount, warningCount } = report

  const levels = ['', 'warning', 'failure']

  let annotations = []
  for (const result of results) {
    const { filePath, messages } = result
    const path = filePath.substring(GITHUB_WORKSPACE.length + 1)
    for (const msg of messages) {
      const { line, severity, ruleId, message } = msg
      const annotationLevel = levels[severity]
      if(line){
        annotations.push({
          path,
          start_line: line,
          end_line: line,
          annotation_level: annotationLevel,
          message: `[${ruleId}] ${message}`
        })
      }
    }
  }
  annotations = annotations.slice(0,49);
  console.log(annotations);
  return {
    conclusion: errorCount > 0 ? 'failure' : 'success',
    output: {
      title: checkName,
      summary: `${errorCount} error(s), ${warningCount} warning(s) found`,
      annotations
    }
  }
}

async function updateCheck(client, id, conclusion, output) {
  await client.checks.update({
        owner: ctx.repo.owner,
        repo: ctx.repo.repo,
        check_run_id: id,
        name: checkName,
        status: "completed",
        conclusion,
        output
  });
}

function exitWithError(err) {
  console.error('Error', err.stack)
  if (err.data) {
    console.error(err.data)
  }
  process.exit(1)
}

async function run() {
  const client = new github.GitHub(GITHUB_TOKEN);
  const id = await createCheck(client)
  try {
    const { conclusion, output } = await eslint(client)
    console.log(output.summary)
    await updateCheck(client, id, conclusion, output)
    if (conclusion === 'failure') {
      process.exit(0)
    }
  } catch (err) {
    await updateCheck(client, id, 'failure')
    exitWithError(err)
  }
}

run().catch(exitWithError)
