# AgentTool Collab

Public distribution of [`@agenttool/collab`](https://www.npmjs.com/package/@agenttool/collab),
local-first coordination for independent coding-agent sessions. Codex, Claude Code, Hermes Agent
and other local MCP clients share one SQLite journal on your machine for task leases, path-conflict
warnings, structured reports, refusable hand-offs, reviewed edit completion and a hash-chained
event log.

It does not spawn, wake or stop agents, or lock files. Leases and reviews are advisory coordination
records: they are not locks, authentication or authority to merge, publish or deploy. Collab itself
replicates nothing between machines, and the journal is local plaintext. Whatever an agent reads
through its tools is visible to that agent's model provider.

## Version 0.5.0

[Release `collab-v0.5.0`](https://github.com/cambridgetcg/agenttool-collab/releases/tag/collab-v0.5.0)
carries the exact archive. It has 33 MCP tools; new since 0.4.0 is `collab_events_wait`, a bounded
wait for new journal events. It also adds review routing, `release_leases` when a session ends,
and the `agenttool-collab-host` command.

| | |
|---|---|
| Archive | `agenttool-collab-0.5.0.tgz` · 390,363 bytes |
| SHA-256 | `fb85aa8bfd021302f9ea95bc35b3c4c37e92ca6f3067098dcc5ef25392a52f29` |
| Source revision | `bc71e87edc2c3cf921a25a38dc01ec4ec49cf157`, tag `collab-v0.5.0` in AgentTool's private development repository |
| Licence | Apache-2.0 |

**0.5.0 is not on the npm registry.** `npm install @agenttool/collab` still gives 0.4.0. The
registry's provenance check needs public source-repository metadata, and the archive names
AgentTool's development repository, which is private. Rather than publish without provenance, this
release is distributed here. The archive includes its TypeScript source (`src/`) alongside the
built server. The archive's `repository` and `homepage` links point at that private repository and
will not open for most people; this page is the public home for 0.5.0.

The archive was built by AgentTool's release tool from the tag above; building it twice gave the
same bytes. [`release/collab-v0.5.0/`](release/collab-v0.5.0/) holds the checksum and the
release tool's receipt. This repository's own `collab-v0.5.0` tag marks the release commit here, not
the source commit. A [GitHub workflow](.github/workflows/verify-release.yml) downloads the published
asset, checks it against the checksum, installs it and compares its tools with
[`tools.txt`](release/collab-v0.5.0/tools.txt). It runs on each release, on manual dispatch, and
weekly while the repository is active (GitHub pauses schedules after 60 days without activity).

## Install

You need [Bun](https://bun.sh) 1.3 or newer on `PATH`; the server runs under Bun.

In a new folder, check the archive, then install it from the file:

```sh
mkdir agenttool-collab && cd agenttool-collab && npm init -y
curl -fLO https://github.com/cambridgetcg/agenttool-collab/releases/download/collab-v0.5.0/agenttool-collab-0.5.0.tgz
shasum -a 256 agenttool-collab-0.5.0.tgz
# fb85aa8bfd021302f9ea95bc35b3c4c37e92ca6f3067098dcc5ef25392a52f29  agenttool-collab-0.5.0.tgz
npm install ./agenttool-collab-0.5.0.tgz
```

This puts two commands in `node_modules/.bin` (run them with `npx`): `agenttool-collab-mcp`, the
stdio MCP server, and `agenttool-collab-host`, for ending a session from the host side.

## Connect a host

The installed package directory is also a plugin for Claude Code and Codex
(`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`). For example, for Claude Code:

```sh
claude --plugin-dir "$PWD/node_modules/@agenttool/collab"
```

Every collaborating process must open the same journal. The default is
`$XDG_DATA_HOME/agenttool/collab.sqlite`, or `~/.local/share/agenttool/collab.sqlite` when
`XDG_DATA_HOME` is unset. To choose another, set `AGENTOOL_COLLAB_DB` in each host's MCP
configuration rather than relying on an inherited shell variable. The plugin manifests set no
environment, so for a different journal register
`bun <package folder>/dist/agenttool-collab-mcp.js` as an MCP server yourself, with
`AGENTOOL_COLLAB_DB` in its environment. Codex, Hermes Agent and
OpenClaw setup, and the full privacy and authority boundary, are in the package's own `README.md`
inside the archive.

The bundled README still describes 0.5.0 as a release candidate. Its text was frozen when the
archive was built, before this release.

## Licence

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE); the archive also carries
`THIRD_PARTY_LICENSES` for the bundled MCP runtime.
