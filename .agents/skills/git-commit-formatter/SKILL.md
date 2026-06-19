---
name: git-commit-formatter
description: Runs lint checks then commits using the Conventional Commits format. Use this when the user asks to commit changes or write a commit message.
---

# Git Commit Formatter Skill

When the user asks to commit, follow this workflow in order. **Do not proceed to the next step if the current step fails.**

## Step 1 — Run lint checks

Detect and run the appropriate lint command for this project:

- If `package.json` has a `lint` script → run `npm run lint`
- Otherwise → run `node --check` on all changed `.js` files:
  `git diff --name-only --cached --diff-filter=ACM | grep '\.js$' | xargs node --check`

If lint **fails**:
- Show the error output to the user
- Stop immediately — do NOT commit
- Tell the user: "Lint failed. Fix the errors above before committing."

If lint **passes** (or there are no JS files to check), continue to Step 2.

## Step 2 — Format the commit message

Follow the Conventional Commits specification.

### Format
`<type>[optional scope]: <description>`

### Allowed Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Instructions
1. Analyze the staged changes to determine the primary `type`.
2. Identify the `scope` if applicable (e.g., a specific file or component).
3. Write a concise `description` in imperative mood ("add feature" not "added feature").
4. If there are breaking changes, add a footer starting with `BREAKING CHANGE:`.

### Example
`feat(firebase): add per-child mastered words sync`

## Step 2.5 — Update version footer

Before committing, update the version footer in `index.html`:

```html
<footer class="app-version">vX.Y · YYYY-MM-DD</footer>
```

1. Read the current version from that line (e.g. `v2.3` or `v2.3.1`).
2. Bump the version based on commit type:
   - `feat` → increment minor (`v2.3` → `v2.4`, reset any patch to nothing)
   - `fix`, `perf` → increment patch (`v2.3` → `v2.3.1`; `v2.3.1` → `v2.3.2`)
   - `chore`, `docs`, `style`, `refactor`, `test` → keep version unchanged, update date only
3. Set the date to today in `YYYY-MM-DD` format.
4. Also update the `app.js` cache-bust query string on the `<script>` tag to match (e.g. `?v=20260618-1`).
5. Stage `index.html` alongside the other changed files.

## Step 3 — Commit

Stage relevant files (including the updated `index.html`) and create the commit using the formatted message.

### README reminder (non-blocking)

If the commit type is `feat` or the changes affect setup, installation, or user-facing behaviour that a new user would need to know about, mention to the user after committing:
> "Heads up: this adds a user-facing feature — README may need updating."

Do not block the commit or check this for `fix`, `chore`, `refactor`, `style`, `perf`, or `test` commits.
