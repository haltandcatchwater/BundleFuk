.PHONY: all install build clean submodules fractal openshell bridge doctor

# ── BundleFuk — monorepo for Fractal + OpenShell + bridge source ───────────

all: submodules install build

# Pull all submodules
submodules:
	git submodule update --init --recursive

# Install Fractal + bridge npm deps
install:
	cd fractal-code-void && npm install
	cd bridge && npm install && npm run build

# Build OpenShell Rust binary
build:
	cd openshell && cargo build --release --bin openshell

# Build just Fractal
fractal:
	cd fractal-code-void && npm run build

# Build just OpenShell
openshell:
	cd openshell && cargo build --release --bin openshell

# Build just the bridge
bridge:
	cd bridge && npm install && npm run build

# Clean
clean:
	cd openshell && cargo clean
	cd fractal-code-void && rm -rf node_modules packages/*/dist
	cd bridge && rm -rf node_modules dist

# Run tests for everything
test:
	cd fractal-code-void && npm test
	cd bridge && npm test
	cd openshell && cargo test -p openshell-fractal

# Update all submodules to latest remote
update:
	git submodule update --remote --recursive
