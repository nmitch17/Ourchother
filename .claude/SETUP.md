# Claude Code Hooks Setup

This project uses Python-based hooks that require `uv` to be installed and available in your PATH.

## Quick Setup

**For macOS (Recommended):**
```bash
brew install uv
```

**For Linux/Other:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then verify:
```bash
which uv && uv --version
```

---

## Installing UV (Required for Hooks)

The hooks in this project use `uv` to run Python scripts. You need to install `uv` in a standard location that's in your PATH.

### ✅ Recommended: Install via Homebrew (macOS)

```bash
brew install uv
```

**Why Homebrew?**
- Automatic PATH setup (installs to `/opt/homebrew/bin/uv`)
- Easy updates with `brew upgrade uv`
- Same installation method across all team Macs
- Already installed on this project

### Alternative: Official installer (macOS/Linux)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Installs to `~/.local/bin/uv` and adds to PATH in your shell profile (requires shell restart).

### Alternative: Install via pip

```bash
pip install uv
```

Installs to your Python's bin directory (may require Python/pip to be installed first).

## Verifying Installation

After installing, verify `uv` is in your PATH:

```bash
which uv
uv --version
```

You should see the path to `uv` and the version number.

## Ensuring Hooks Work

The hooks are configured in `.claude/settings.local.json` and use commands like:

```
uv run .claude/hooks/pre_tool_use.py
```

For these to work correctly:

1. ✅ `uv` must be installed and in your PATH
2. ✅ You must be in the project root directory when Claude Code runs
3. ✅ The hook scripts must have execute permissions (already set)

## Troubleshooting

### "command not found: uv"

If you see this error, `uv` is not in your PATH. Options:

1. **Reinstall using Homebrew** (macOS): `brew install uv`
2. **Add to PATH manually**: Add this to your `~/.zshrc` or `~/.bashrc`:
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```
   Then restart your terminal or run `source ~/.zshrc`

### "Failed to spawn: .claude/hooks/..."

If you see this error, it means:
- `uv` is found but can't locate the script file
- You might not be in the correct working directory
- Check that you're in the project root: `/Users/nickmitchell/Documents/White Rabbit/rova`

### Verifying Hook Setup

Test the hooks manually:

```bash
cd /Users/nickmitchell/Documents/White\ Rabbit/rova
echo '{"tool":"Read","parameters":{"file_path":"test.txt"}}' | uv run .claude/hooks/pre_tool_use.py
```

This should run without errors (silent output is expected).

## Cross-Machine Setup

When setting up this project on a new machine:

1. Clone the repository
2. Install `uv` using one of the methods above
3. Verify `uv` is in PATH with `which uv`
4. Open Claude Code in the project directory
5. Hooks should work automatically

The `.claude/settings.local.json` file is checked into the repository and should work across all machines as long as `uv` is properly installed.
