.PHONY: all install build clean submodules fractal openshell bridge test

# ── BundleFuk — monorepo for Fractal + OpenShell + bridge source ───────────

all: submodules install build

# Pull all submodules
submodules:
	git submodule update --init --recursive

# Install Fractal + bridge npm deps (per-package, handles file: deps)
install:
	cd fractal-code-void && for pkg in channels parser sdk runtime validator fractalclaw mcp-server runner; do (cd $$pkg && npm install); done
	cd bridge && npm install && npm run build

# Build everything that can be built locally
build: fractal bridge
	@if command -v cargo >/dev/null 2>&1; then \
		$(MAKE) openshell; \
	else \
		echo "NOTE: Rust/Cargo not found — skipping OpenShell build."; \
		echo "      Install Rust: https://rustup.rs"; \
	fi

# Build just Fractal (TypeScript, 8 packages in dependency order)
fractal:
	cd fractal-code-void && for pkg in channels parser sdk runtime validator fractalclaw mcp-server runner; do (cd $$pkg && npm run build 2>/dev/null); done

# Build just OpenShell (Rust — requires cargo)
openshell:
	cd openshell && cargo build --release --bin openshell

# Build just the bridge
bridge:
	cd bridge && npm install && npm run build

# Clean
clean:
	cd fractal-code-void && for d in channels parser sdk runtime validator fractalclaw mcp-server runner; do rm -rf $$d/dist $$d/node_modules; done
	cd bridge && rm -rf node_modules dist
	@if command -v cargo >/dev/null 2>&1; then cd openshell && cargo clean; fi

# Run tests for everything
test:
	cd fractal-code-void && for pkg in channels parser sdk runtime validator fractalclaw mcp-server; do (cd $$pkg && npx vitest run 2>/dev/null); done
	cd bridge && npm test
	@if command -v cargo >/dev/null 2>&1; then cd openshell && cargo test -p openshell-fractal; else echo "Skipping OpenShell tests (no cargo)"; fi

# Update all submodules to latest remote
update:
	git submodule update --remote --recursive
