import inquirer from "inquirer";
import { git } from "../utils/git.js";

export async function stashMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Stash options",
      choices: [
        "Save current changes to stash",
        "Apply last stash (keep it)",
        "Apply and remove last stash",
        "Delete all saved stashes",
      ],
    },
  ]);

  if (action === "Save current changes to stash") await git(["stash"]);
  if (action === "Apply last stash (keep it)") await git(["stash", "apply"]);
  if (action === "Apply and remove last stash") await git(["stash", "pop"]);
  if (action === "Delete all saved stashes") await git(["stash", "clear"]);
}
