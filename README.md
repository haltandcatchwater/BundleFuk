# BundleFuk

**One clone. One install. Everything.**

```
git clone --recurse-submodules https://github.com/haltandcatchwater/BundleFuk.git
cd BundleFuk
npm install
```

## What's inside

```
BundleFuk/
├── fractal-code-void/        ← git submodule — Fractal Code (8 npm packages)
│   ├── channels/             ← 45+ I/O adapters (Anthropic, Stripe, GitHub...)
│   ├── parser/               ← .fc file parser
│   ├── sdk/                  ← base cell types + Universal Contract
│   ├── runtime/              ← Javy Wasm void sandbox
│   ├── validator/            ← constitutional checks (10+ gates)
│   ├── fractalclaw/          ← orchestrator / CLI
│   ├── mcp-server/           ← MCP governance server
│   └── runner/               ← user-facing CLI + dashboard
│
├── openshell/                ← git submodule — OpenShell fork (Rust)
│   ├── crates/openshell-fractal/  ← NEW: cell runner, constitution, channel mapper
│   ├── crates/openshell-cli/      ← MODIFIED: `openshell fractal` subcommand
│   ├── crates/openshell-sandbox/  ← kernel-enforced container isolation
│   ├── crates/openshell-policy/   ← YAML policy engine
│   ├── crates/openshell-prover/   ← formal verification (Z3)
│   └── ... (15 more crates)
│
├── bridge/                   ← git submodule — Fractal→OpenShell compiler
│   ├── src/compiler/         ← channel→policy YAML compiler
│   ├── src/prover/           ← prover gate wrapper
│   └── docker/               ← BYOC sandbox Dockerfile
│
├── bin/bundlefuk.js          ← CLI: `bundlefuk doctor`
├── install.js                ← postinstall: downloads prebuilt openshell binary
├── package.json              ← meta-package: depends on @fractalcode/runner
└── Makefile                  ← one-command build everything
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BundleFuk                         │
│                                                     │
│  ┌─────────────────┐  ┌───────────────────────────┐ │
│  │  Fractal Code    │  │  OpenShell (fork)         │ │
│  │  (TypeScript)    │  │  (Rust)                   │ │
│  │                 │  │                           │ │
│  │  • .fc parser   │  │  • openshell-fractal crate│ │
│  │  • SDK + types  │  │  • sandbox isolation      │ │
│  │  • 45+ channels │  │  • policy engine          │ │
│  │  • Wasm runtime │  │  • prover (Z3)            │ │
│  │  • validator    │  │  • privacy router         │ │
│  │  • MCP server   │  │                           │ │
│  │  • CLI + dash   │  │  `openshell fractal` CLI  │ │
│  └────────┬────────┘  └───────────┬───────────────┘ │
│           │                       │                  │
│           └───────────┬───────────┘                  │
│                       │                              │
│              ┌────────┴────────┐                     │
│              │     Bridge      │                     │
│              │  (TypeScript)   │                     │
│              │                 │                     │
│              │  channels →     │                     │
│              │  policy.yaml    │                     │
│              └─────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

## Quick start

```bash
# Clone with everything
git clone --recurse-submodules https://github.com/haltandcatchwater/BundleFuk.git
cd BundleFuk

# Install Fractal (TypeScript)
cd fractal-code-void && npm install && cd ..

# Build OpenShell (Rust — needs Rust toolchain)
cd openshell && cargo build --release --bin openshell && cd ..

# Build the bridge
cd bridge && npm install && npm run build && cd ..

# Verify
node bin/bundlefuk.js doctor
```

## What you can do

```bash
# Work on Fractal source
cd fractal-code-void
# ... edit channels, parser, runtime, etc.

# Work on OpenShell + Fractal crate
cd openshell
# ... edit crates/openshell-fractal/

# Work on the bridge
cd bridge
# ... edit src/compiler/

# Run the whole thing
fractal-runner serve              # Fractal API + dashboard
openshell fractal validate ./cell.fc  # Constitutional check
```

## Submodule remotes

| Directory | Remote |
|---|---|
| `fractal-code-void/` | `haltandcatchwater/fractal-code-void` |
| `openshell/` | `haltandcatchwater/OpenShell` (fork of NVIDIA/OpenShell) |
| `bridge/` | `haltandcatchwater/fractal-openshell-bridge` |

## License

Each submodule carries its own license:
- **Fractal Code**: GPLv3 + commercial dual-license
- **OpenShell fork**: Apache-2.0
- **Bridge**: Apache-2.0
- **BundleFuk installer**: Apache-2.0
