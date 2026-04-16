import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd: string) {
  try {
    const result = await execFileAsync("git", args, {
      cwd,
      maxBuffer: 1024 * 1024 * 10,
      windowsHide: true,
    });
    return {
      ok: true,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    };
  } catch (error) {
    const failure = error as {
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    return {
      ok: false,
      stdout: failure.stdout?.trim() || "",
      stderr: failure.stderr?.trim() || failure.message || "Git command failed.",
    };
  }
}

export async function getChangedFiles(cwd: string) {
  const status = await git(["status", "--short"], cwd);
  if (!status.ok || !status.stdout) {
    return [];
  }

  return status.stdout
    .split(/\r?\n/)
    .map((line) => ({
      status: line.slice(0, 2).trim() || "modified",
      path: line.slice(3).trim(),
    }))
    .filter((file) => file.path.length > 0);
}

export async function getDiffStat(cwd: string) {
  const [stat, nameOnly] = await Promise.all([
    git(["diff", "--stat"], cwd),
    git(["diff", "--name-only"], cwd),
  ]);

  return {
    stat: stat.stdout || stat.stderr,
    files: nameOnly.stdout
      ? nameOnly.stdout.split(/\r?\n/).filter(Boolean)
      : [],
  };
}

export async function getGitSummary(cwd: string) {
  const [changedFiles, diff] = await Promise.all([
    getChangedFiles(cwd),
    getDiffStat(cwd),
  ]);

  return {
    changedFiles,
    diffStat: diff.stat,
    diffFiles: diff.files,
  };
}
