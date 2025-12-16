import ora from 'ora'
import inquirer from 'inquirer'
import { git } from '../utils/git.js'

export async function push() {
  const spinner = ora('Pushing...').start()

  try {
    await git(['push'])
    spinner.succeed('Push complete')
  } catch {
    spinner.fail('Push rejected')

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Remote has new commits:',
        choices: ['Rebase and retry', 'Force push', 'Cancel']
      }
    ])

    if (action === 'Rebase and retry') {
      await git(['pull', '--rebase'])
      await git(['push'])
    }

    if (action === 'Force push') {
      await git(['push', '--force'])
    }
  }
}
