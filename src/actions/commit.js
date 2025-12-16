import inquirer from "inquirer";
import ora from "ora";
import { execa } from "execa";
import { git } from "../utils/git.js";

export async function commit() {
  const { message } = await inquirer.prompt([
    {
      type: "input",
      name: "message",
      message: "Commit message:",
      validate: (m) => m.length > 0,
    },
  ]);

  const spinner = ora("Creating commit...").start();

  await git(["add", "."]);
  await git(["commit", "-m", message]);

  spinner.succeed("Commit created");

  // detect remote
  try {
    const { stdout } = await execa("git", ["remote"]);
    if (!stdout.includes("origin")) return;

    const { push } = await inquirer.prompt([
      {
        type: "confirm",
        name: "push",
        message: "Push commit to origin?",
        default: true,
      },
    ]);

    if (push) {
      await git(["push"]);
    }
  } catch {
    // silently ignore
  }
}
