import { sources, ExtensionContext, ISource, SourceType } from 'coc.nvim'
import request from 'request'
import * as child from 'child_process'

export async function activate(context: ExtensionContext): Promise<void> {
  let source: ISource = {
    name: 'github',
    enable: true,
    filetypes: ['gitcommit'],
    priority: 99,
    sourceType: SourceType.Service,
    triggerCharacters: ['#'],
    doComplete: async function () {
      const issues = await getIssues()
      return {
        items: issues.map(i => {
          return {
            word: i.character,
            abbr: `#${i.character} ${i.description}`,
            filterText: i.character + i.description
          }
        })
      }
    }
  }
  context.subscriptions.push(sources.createSource(source))
}

async function getIssues(): Promise<Issue[]> {
  let repoUrl = await getRepoUrl()
  let options = {
    url: repoUrl,
    headers: { 'User-Agent': 'request' }
  }
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        let issues = getCandidates(body)
        resolve(issues)
      } else {
        reject([])
      }
    })
  }).then(result => {
    return result
  }).catch((err) => {
    return err
  })
}

function getCandidates(body: string) {
  let info = JSON.parse(body)
  let candidates = []
  for (let i = 0, len = info.length; i < len; i++) {
    let issue = {
      character: info[i].number.toString(),
      description: info[i].title
    }
    candidates.push(issue)
  }
  return candidates;
}

async function getRepoUrl(): Promise<string> {
  let cmd = 'git remote get-url origin'
  return new Promise((resolve, reject) => {
    child.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(stderr)
      } else {
        let remote = stdout.split('\n')[0]
        let repoUrl = remote.replace(/\.git$/, '')
        // for uri like `git@github.com:username/reponame.git`
        if (repoUrl.startsWith('git')) {
          let repo = repoUrl.slice(4)
          let info = repo.split(':', 2)
          repoUrl = `https://api.github.com/repos/${info[1]}/issues?state=all`
        }
        resolve(repoUrl)
      }
    })
  })
}

interface Issue {
  character: string;
  description: string;
}
