import path from "node:path";

export function normalizeLocalPath(localPath: string) {
  return path.resolve(localPath.trim());
}

export function getRepoNameFromPath(localPath: string) {
  const normalized = normalizeLocalPath(localPath);
  return path.basename(normalized) || normalized;
}

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
