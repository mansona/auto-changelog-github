const { readFileSync } = require('fs');
const { join } = require('path');
const pMap = require('p-map');
const hostedGitInfo = require('hosted-git-info');

const GithubAPI = require('./lib/github');

function getPkg() {
  return JSON.parse(readFileSync(join(process.cwd(), 'package.json')));
}

function findRepoFromPkg() {
  const pkg = getPkg();
  const url = pkg.repository.url || pkg.repository;
  const info = hostedGitInfo.fromUrl(url);
  if (info && info.type === "github") {
    return `${info.user}/${info.project}`;
  }
}

async function downloadIssueData(merges, options) {
  let repo = findRepoFromPkg();
  let github = new GithubAPI(options);
  await pMap(
    merges,
    async (merge) => {
      if (merge.id) {
        try {
          merge.githubIssue = await github.getIssueData(repo, merge.id);
        } catch (err) {
          console.error(`Error fetching github data for ${merge.id}: ${error}`);
        }
      }
    },
    { concurrency: 5 }
  );
}

function processMerges(merges) {
  return downloadIssueData(merges);
}

module.exports = {
  processMerges,
}
