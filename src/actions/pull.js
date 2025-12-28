import ora from "ora";
import inquirer from "inquirer";
import { git } from "../utils/git.js";

export async function pull() {
  const spinner = ora("Checking for updates...").start();

  try {
    await git(["pull", "--rebase"]);
    spinner.succeed("Repository updated");
  } catch (error) {
    if (error.message.includes("exit code 128")) {
      spinner.stop();

      const { shouldStash } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldStash",
          message: "You have uncommitted changes. Stash them and continue?",
          default: true,
        },
      ]);

      if (!shouldStash) {
        console.log("Pull cancelled. Commit or stash your changes first.");
        return;
      }

      spinner.start("Stashing changes and pulling...");

      try {
        await git(["stash"]);
        await git(["pull", "--rebase"]);

        // Tenta aplicar o stash automaticamente
        spinner.text = "Applying stashed changes...";
        await git(["stash", "pop"]);
        spinner.succeed("Pull completed. Changes restored.");
      } catch (stashError) {
        if (stashError.message.includes("conflict")) {
          spinner.warn("Pull completed with conflicts. Resolve them manually.");
          console.log(
            'Use "git stash pop" to restore your changes and resolve conflicts.',
          );
        } else {
          spinner.fail("Operation failed");
          console.error("Error:", stashError.message);
        }
      }
    } else {
      spinner.fail("Pull failed");
      console.error("Error:", error.message);
    }
  }
}
