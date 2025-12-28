import ora from "ora";
import inquirer from "inquirer";
import { git } from "../utils/git.js";
import { commit } from "./commit.js";

async function hasLocalChanges() {
  const status = await git(["status", "--porcelain"]);
  return Boolean(status.trim());
}

export async function pull() {
  const spinner = ora("Checking repository status...").start();

  try {
    const dirty = await hasLocalChanges();
    spinner.stop();

    let stashed = false;

    if (dirty) {
      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "Local changes detected. What should I do?",
          choices: [
            {
              name: "Stash changes, then pull (safe)",
              value: "stash",
            },
            {
              name: "Commit changes, then pull",
              value: "commit",
            },
            {
              name: "Cancel",
              value: "cancel",
            },
          ],
          default: "stash",
        },
      ]);

      if (action === "cancel") return;

      if (action === "commit") {
        await commit();
      }

      if (action === "stash") {
        spinner.start("Stashing local changes...");
        await git(["stash"]);
        spinner.succeed("Changes stashed");
        stashed = true;
      }
    }

    spinner.start("Pulling remote changes...");
    await git(["pull", "--rebase"]);
    spinner.succeed("Repository updated");

    if (stashed) {
      spinner.start("Restoring local changes...");
      try {
        await git(["stash", "pop"]);
        spinner.succeed("Local changes restored");
      } catch {
        spinner.warn("Local changes could not be fully restored");
      }
    }
  } catch (error) {
    spinner.fail("Pull failed");
    console.error(error.message);
  }
}
