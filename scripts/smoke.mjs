// Start an installed agenttool-collab-mcp on a throwaway journal, check its
// reported version and exact tool list over stdio, then stop it.
// Usage: node scripts/smoke.mjs <agenttool-collab-mcp> <journal.sqlite> <version> <tools.txt>
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const [server, journal, version, toolsFile] = process.argv.slice(2);
const expected = readFileSync(toolsFile, "utf8").split("\n").filter(Boolean).sort();

// The server under test gets only what it needs, never the caller's tokens.
const child = spawn(server, [], {
  env: { PATH: process.env.PATH, HOME: process.env.HOME, AGENTOOL_COLLAB_DB: journal },
  stdio: ["pipe", "pipe", "inherit"],
});
let done = false;
const finish = (code, message) => {
  if (done) return;
  done = true;
  console.log(message);
  child.kill();
  process.exit(code);
};
child.on("error", (error) => finish(1, `could not start ${server}: ${error.message}`));
child.on("exit", (code, signal) => finish(1, `server exited early (${code ?? signal})`));
setTimeout(() => finish(1, "timed out waiting for the MCP server"), 20000);
const send = (message) => child.stdin.write(JSON.stringify(message) + "\n");

let buffer = "";
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  for (let end; (end = buffer.indexOf("\n")) >= 0;) {
    const message = JSON.parse(buffer.slice(0, end));
    buffer = buffer.slice(end + 1);
    if (message.error) finish(1, `server error: ${JSON.stringify(message.error)}`);
    if (message.id === 1) {
      const info = message.result.serverInfo;
      if (info.name !== "agenttool-collab" || info.version !== version) {
        finish(1, `unexpected server ${JSON.stringify(info)}`);
      }
      send({ jsonrpc: "2.0", method: "notifications/initialized" });
      send({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    } else if (message.id === 2) {
      const names = message.result.tools.map((tool) => tool.name).sort();
      if (JSON.stringify(names) !== JSON.stringify(expected)) {
        finish(1, `tool list differs from ${toolsFile}: ${JSON.stringify(names)}`);
      }
      finish(0, `agenttool-collab ${version}: ${names.length} tools match ${toolsFile}`);
    }
  }
});
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "verify-release", version: "1" } },
});
