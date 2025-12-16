import inquirer from 'inquirer'
import ora from 'ora'
import { execa } from 'execa'
import { git } from '../utils/git.js'

export async function commit({ autoPush = true } = {}) {
  const { message } = await inquirer.prompt([
    {
      type: 'input',
      name: 'message',
      message: 'Commit message:',
      validate: m => m.length > 0
    }
  ])

  const spinner = ora('Creating commit...').start()

  await git(['add', '.'])
  await git(['commit', '-m', message])

  spinner.succeed('Commit created')

  if (!autoPush) return

  try {
    await git(['push'])
  } catch {
    const { push } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'push',
        message: 'No upstream found. Push and set upstream?',
        default: true
      }
    ])

    if (push) {
      const { stdout: branch } = await execa('git', ['branch', '--show-current'])
      await git(['push', '-u', 'origin', branch])
    }
  }
}
