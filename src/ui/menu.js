import inquirer from 'inquirer'
import fs from 'fs'
import { execa } from 'execa'
import { getRepoState } from '../core/state.js'
import { git } from '../utils/git.js'
import { commit } from '../actions/commit.js'
import { push } from '../actions/push.js'
import { pull } from '../actions/pull.js'
import { branchMenu } from '../actions/branch.js'
import { stashMenu } from '../actions/stash.js'
import { logMenu } from '../actions/log.js'
import { clean } from '../actions/clean.js'
import { nuclearMenu } from '../actions/nuclear.js'

function detectGitignore() {
  if (fs.existsSync('package.json')) {
    return 'node_modules\n.env\ndist\n'
  }
  if (fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt')) {
    return '__pycache__\n.env\n.venv\n'
  }
  if (fs.existsSync('go.mod')) {
    return 'bin/\n'
  }
  return '.DS_Store\n'
}

export async function mainMenu() {
  const state = await getRepoState()

  // INIT FLOW
  if (!state.initialized) {
    await git(['init'])
    await git(['branch', '-M', 'main'])

    if (!fs.existsSync('.gitignore')) {
      fs.writeFileSync('.gitignore', detectGitignore())
    }

    await git(['add', '.'])
    await git(['commit', '-m', 'chore: initial commit'])

    return mainMenu()
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Branch: ${state.branch}`,
      choices: [
        'Save work (commit + push)',
        'Sync repo (pull + push)',
        'Clean slate (stash + pull + pop)',
        'Commit changes',
        'Push',
        'Pull',
        'Switch / Create branch',
        'Stash changes',
        'View history',
        'Cleanup repo',
        'Nuclear options ☢',
        'Exit'
      ]
    }
  ])

  if (action === 'Save work') {
    await commit()
    return mainMenu()
  }

  if (action === 'Sync repo') {
    await pull()
    await push()
    return mainMenu()
  }

  if (action === 'Clean slate') {
    await git(['stash'])
    await pull()
    await git(['stash', 'pop'])
    return mainMenu()
  }

  const map = {
    'Commit changes': commit,
    'Push': push,
    'Pull': pull,
    'Switch / Create branch': branchMenu,
    'Stash changes': stashMenu,
    'View history': logMenu,
    'Cleanup repo': clean,
    'Nuclear options ☢': nuclearMenu
  }

  if (map[action]) {
    await map[action]()
    return mainMenu()
  }
}
