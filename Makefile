.PHONY: all install build clean doctor submodules

# ── BundleFuk — one command to build everything ────────────────────────────

all: submodules install build

# Pull all submodules
submodules:
	git submodule update --init --recursive

# Install all npm dependencies (Fractal + bridge)
install:
	cd fractal-code-void && npm install
	cd bridge && npm install && npm run build

# Build OpenShell with Fractal crate (needs Rust toolchain)
build:
	cd openshell && cargo build --release --bin openshell

# Full clean build
clean:
	cd openshell && cargo clean
	cd fractal-code-void && rm -rf node_modules dist
	cd bridge && rm -rf node_modules dist

# Doctor check
doctor:
	node bin/bundlefuk.js doctor

# Run Fractal
serve:
	cd fractal-code-void && npx fractal-runner serve

# Run OpenShell Fractal CLI
fractal:
	cd openshell && cargo run --release --bin openshell -- fractal --help

# Update all submodules to latest
update:
	git submodule update --remote --recursive
