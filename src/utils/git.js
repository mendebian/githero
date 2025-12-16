import { execa } from 'execa'

export async function git(args, options = {}) {
  try {
    return await execa('git', args, {
      stdio: 'inherit',
      ...options
    })
  } catch (err) {
    throw new Error(err.stderr || err.message)
  }
}
