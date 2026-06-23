# Claude instructions for this repo

## Committing
Always use the `/push` skill when the user asks to commit or push. Never use raw `git add` / `git commit` / `git push` commands directly.

## Before invoking /push
Check whether README.md needs updating for the changes being committed:
- New features or UI changes → add or update the relevant feature description
- New files (e.g. logic.js, tests/, screenshots/) → update the File structure section
- Bug fixes that change documented behaviour (e.g. spaced-repetition table, SW caching strategy) → correct the relevant section
- Version bump → update footer reference if mentioned in README

Only skip the README update if the commit is purely internal (e.g. refactor with no user-visible change, dependency bump, config tweak).
