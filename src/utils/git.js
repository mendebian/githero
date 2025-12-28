import { execa } from "execa";

export async function git(args, options = {}) {
  const defaultOptions = {
    cwd: process.cwd(),
    stdio: "pipe",
    reject: false,
  };

  const result = await execa("git", args, { ...defaultOptions, ...options });

  if (result.failed) {
    const error = new Error(
      result.stderr || result.stdout || "Git command failed",
    );
    error.exitCode = result.exitCode;
    error.stdout = result.stdout;
    error.stderr = result.stderr;
    error.command = `git ${args.join(" ")}`;
    throw error;
  }

  return result.stdout;
}
