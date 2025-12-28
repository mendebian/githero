import inquirer from "inquirer";
import { git } from "../utils/git.js";
import ora from "ora";

export async function reset() {
  const spinner = ora("Checking for changes...").start();

  try {
    const status = await git(["status", "--porcelain"]);

    if (!status.trim()) {
      spinner.succeed("Working directory clean");
      return;
    }

    spinner.stop();

    console.log("\nUncommitted changes:");
    console.log(status);
    console.log("");

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Reset all changes to last commit?",
        default: false,
      },
    ]);

    if (!confirm) {
      console.log("Cancelled");
      return;
    }

    spinner.start("Resetting...");
    await git(["reset", "--hard", "HEAD"]);
    await git(["clean", "-fd"]);
    spinner.succeed("All changes reset");
  } catch (error) {
    spinner.fail("Reset failed");
    console.error("Error:", error.message);
  }
}
