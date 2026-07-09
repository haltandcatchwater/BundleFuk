# BundleFuk

Monorepo for the full Fractal + OpenShell source tree. One clone, everything on disk.

```
git clone --recurse-submodules https://github.com/haltandcatchwater/BundleFuk.git
cd BundleFuk
make all
```

## What's on disk

```
BundleFuk/
├── fractal-code-void/       ← git submodule — Fractal Code
│   ├── channels/            ← 45+ typed I/O adapters
│   ├── parser/              ← .fc file parser
│   ├── sdk/                 ← base cell types
│   ├── runtime/             ← Javy Wasm void
│   ├── validator/           ← constitutional checks
│   ├── fractalclaw/         ← orchestrator
│   ├── mcp-server/          ← MCP governance
│   ├── runner/              ← CLI + dashboard
│   └── pipelines/           ← example scaffolds
│
├── openshell/               ← git submodule — OpenShell fork
│   └── crates/
│       ├── openshell-fractal/   ← NEW: cell runner, constitution, channel mapper
│       ├── openshell-cli/       ← MODIFIED: `openshell fractal` subcommand
│       ├── openshell-sandbox/   ← kernel container isolation
│       ├── openshell-policy/    ← YAML policy engine
│       ├── openshell-prover/    ← Z3 formal verification
│       └── ... (15 more crates)
│
└── bridge/                  ← git submodule — Fractal→OpenShell compiler
    └── src/
        ├── compiler/        ← channel→policy YAML compiler
        └── prover/          ← prover gate wrapper
```

## Architecture

```
┌──────────────────────────────────────────────┐
│                 BundleFuk                     │
│                                              │
│  ┌────────────────┐  ┌────────────────────┐  │
│  │  fractal-code- │  │     openshell      │  │
│  │  void (TS)     │  │     (Rust)         │  │
│  │                │  │                    │  │
│  │  Logic layer:  │  │  Sandbox layer:    │  │
│  │  • parsing     │  │  • kernel enforce  │  │
│  │  • validation  │  │  • policy engine   │  │
│  │  • channels    │  │  • prover (Z3)     │  │
│  │  • Wasm void   │  │  • privacy router  │  │
│  │  • MCP server  │  │                    │  │
│  │  • dashboard   │  │  openshell fractal │  │
│  └───────┬────────┘  └─────────┬──────────┘  │
│          │                     │              │
│          └──────────┬──────────┘              │
│                     │                         │
│            ┌────────┴────────┐                │
│            │     bridge      │                │
│            │    (TS)         │                │
│            │                 │                │
│            │  .fc channels → │                │
│            │  policy.yaml    │                │
│            └─────────────────┘                │
└──────────────────────────────────────────────┘
```

## Building

```bash
make all        # submodules + install + build
make test       # run all tests
make update     # pull latest submodule commits
```

Or per-component:

```bash
make fractal    # build Fractal (TypeScript)
make openshell  # build OpenShell (Rust)
make bridge     # build bridge (TypeScript)
```

## Working on source

Each directory is its own git repo. Work inside it like normal:

```bash
cd fractal-code-void
# ... make changes ...
git commit -m "feat: ..."
git push origin main

cd ../openshell
# ... make changes to crates/openshell-fractal/ ...
git commit -m "feat(fractal): ..."
git push origin main

# Back in BundleFuk, pin the new submodule commits:
cd ..
git add fractal-code-void openshell
git commit -m "chore: bump submodules"
git push origin main
```

## Submodule remotes

| Directory | Remote |
|---|---|
| `fractal-code-void/` | `haltandcatchwater/fractal-code-void` |
| `openshell/` | `haltandcatchwater/OpenShell` (fork of NVIDIA/OpenShell) |
| `bridge/` | `haltandcatchwater/fractal-openshell-bridge` |

## Licenses

| Component | License |
|---|---|
| Fractal Code | GPLv3 + commercial dual |
| OpenShell | Apache-2.0 |
| Bridge | Apache-2.0 |
