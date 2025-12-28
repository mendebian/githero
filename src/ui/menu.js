import inquirer from "inquirer";
import fs from "fs";
import { getRepoState } from "../core/state.js";
import { git } from "../utils/git.js";
import { commit } from "../actions/commit.js";
import { push } from "../actions/push.js";
import { pull } from "../actions/pull.js";
import { branchMenu } from "../actions/branch.js";
import { stashMenu } from "../actions/stash.js";
import { logMenu } from "../actions/log.js";
import { clean } from "../actions/clean.js";
import { nuclearMenu } from "../actions/nuclear.js";
import { cloneRepo } from "../actions/clone.js";

function detectGitignore() {
  if (fs.existsSync("package.json")) {
    return "node_modules\n.env\ndist\n";
  }
  if (fs.existsSync("pyproject.toml") || fs.existsSync("requirements.txt")) {
    return "__pycache__\n.env\n.venv\n";
  }
  if (fs.existsSync("go.mod")) {
    return "bin/\n";
  }
  return ".DS_Store\n";
}

export async function mainMenu() {
  const state = await getRepoState();

  // CLONE FLOW (fora de repo)
  if (!state.initialized) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "No Git repository detected",
        choices: ["Initialize new repository", "Clone repository", "Exit"],
      },
    ]);

    if (action === "Clone repository") {
      await cloneRepo();
      return mainMenu();
    }

    if (action === "Initialize new repository") {
      await git(["init"]);
      await git(["branch", "-M", "main"]);

      if (!fs.existsSync(".gitignore")) {
        fs.writeFileSync(".gitignore", detectGitignore());
      }

      await git(["add", "."]);
      await git(["commit", "-m", "chore: initial commit"]);

      return mainMenu();
    }

    return;
  }

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: `Branch: ${state.branch}`,
      choices: [
        "Commit",
        "Push",
        "Pull",
        "Reset local changes",
        "Switch / Create branch",
        "Stash changes",
        "View history",
        "Clean untracked files",
        "Exit",
      ],
    },
  ]);

  const map = {
    Commit: commit,
    Push: push,
    Pull: pull,
    "Reset local changes": reset,
    "Switch / Create branch": branchMenu,
    "Stash changes": stashMenu,
    "View history": logMenu,
    "Clean untracked files": clean,
    "Nuclear options ☢": nuclearMenu,
  };

  if (map[action]) {
    await map[action]();
    return mainMenu();
  }
}
