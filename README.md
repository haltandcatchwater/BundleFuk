# BundleFuk

**One install — Fractal Code + OpenShell sandbox.**

```
npm install -g bundlefuk
```

That's it. You get:

| Layer | What | How |
|---|---|---|
| **Logic** | `@fractalcode/runner` + 8 Fractal packages + bridge | npm dependency |
| **Sandbox** | `openshell` binary with Fractal crate | Downloaded from GitHub Releases |
| **Fallback** | Javy Wasm void sandbox | Built into Fractal runtime |

## Architecture

```
npm install -g bundlefuk
  │
  ├─► npm installs @fractalcode/runner        ← logic layer (TypeScript)
  │     ├── @fractalcode/channels              ← 45+ I/O adapters
  │     ├── @fractalcode/parser                ← .fc file parser
  │     ├── @fractalcode/sdk                   ← base cell types
  │     ├── @fractalcode/runtime               ← Wasm void sandbox
  │     ├── @fractalcode/validator             ← constitutional checks
  │     ├── @fractalcode/fractalclaw           ← orchestrator
  │     ├── @fractalcode/mcp-server            ← MCP governance
  │     └── @fractalcode/bridge                ← Fractal→OpenShell compiler
  │
  └─► postinstall downloads openshell binary   ← sandbox layer (Rust)
        └── haltandcatchwater/OpenShell fork
              └── openshell-fractal crate
                    ├── cell_runner             ← run cells in sandboxes
                    ├── constitution            ← constitutional gating
                    └── channel_mapper          ← channels → policy YAML
```

## Commands

```bash
bundlefuk doctor              # verify everything works

# Fractal Code (logic layer)
fractal-runner init           # scaffold a new project
fractal-runner serve          # boot API (:3000) + dashboard (:3001)
fractal-runner run <pipeline> # execute a pipeline

# OpenShell sandbox (hardened execution)
openshell fractal validate ./my_cell.fc
openshell fractal run cell ./my_cell.fc --input '{"x":1}'
openshell fractal channels ./my_cell.fc --output policy.yaml
```

## Sandbox tiers

| Tier | What | Isolation | How to get |
|---|---|---|---|
| **Built-in** | Javy Wasm void | Process-level | Always available |
| **OpenShell** | Kernel-enforced container | Filesystem + network + process | Auto-downloaded by postinstall |

If the OpenShell binary download fails (no internet, unsupported platform), Fractal
still works — it falls back to the Wasm void sandbox automatically.

## Requirements

- Node.js >= 20
- For OpenShell sandbox: Docker (auto-detected, graceful fallback if absent)

## Repos

| Repo | Purpose |
|---|---|
| `haltandcatchwater/BundleFuk` | This repo — the one-stop installer |
| `haltandcatchwater/OpenShell` | NVIDIA OpenShell fork + openshell-fractal crate |
| `haltandcatchwater/fractal-code-void` | Fractal Code (npm packages) |
| `haltandcatchwater/fractal-openshell-bridge` | Fractal→OpenShell compiler bridge |

## License

Apache-2.0. The bundled OpenShell binary is built from the Apache-2.0 licensed
NVIDIA OpenShell fork. Fractal Code packages are GPLv3 + commercial dual-licensed.
