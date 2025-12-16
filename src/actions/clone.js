import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import { execa } from "execa";
import { git } from "../utils/git.js";

export async function cloneRepo() {
  const { repo } = await inquirer.prompt([
    {
      type: "input",
      name: "repo",
      message: "Repository URL (HTTPS or SSH):",
      validate: (r) => r.length > 0,
    },
  ]);

  const defaultDir = path.basename(repo.replace(/\.git$/, ""));

  const { dir } = await inquirer.prompt([
    {
      type: "input",
      name: "dir",
      message: "Destination folder:",
      default: defaultDir,
    },
  ]);

  const spinner = ora("Cloning repository...").start();
  await git(["clone", repo, dir]);
  spinner.succeed("Repository cloned");

  process.chdir(dir);

  // fetch branches
  const { stdout } = await execa("git", ["branch", "-r"]);
  const branches = stdout
    .split("\n")
    .map((b) => b.trim())
    .filter((b) => b.startsWith("origin/"))
    .map((b) => b.replace("origin/", ""));

  if (branches.length > 1) {
    const { branch } = await inquirer.prompt([
      {
        type: "list",
        name: "branch",
        message: "Checkout which branch?",
        choices: branches,
      },
    ]);

    await git(["checkout", branch]);
  }
}
