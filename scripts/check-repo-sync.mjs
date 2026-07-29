import { execFileSync } from "node:child_process";

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`Repo kontrolu basarisiz: ${message}`);
  process.exit(1);
}

const branch = runGit(["branch", "--show-current"]);
const localHead = runGit(["rev-parse", "HEAD"]);
const remoteHead = runGit(["ls-remote", "origin", `refs/heads/${branch}`]).split(/\s+/)[0];

if (!branch) {
  fail("aktif branch bulunamadi.");
}

if (!remoteHead) {
  fail(`origin/${branch} bulunamadi.`);
}

if (localHead !== remoteHead) {
  fail(`local HEAD origin/${branch} ile eslesmiyor. local=${localHead.slice(0, 7)} remote=${remoteHead.slice(0, 7)}`);
}

console.log(`Repo kontrolu gecti: ${branch} ${localHead.slice(0, 7)} origin ile eslesiyor.`);
