# AGENTS.md

Instructions for AI coding agents working in this repository live in [CLAUDE.md](CLAUDE.md). Read it first, then [SPEC.md](SPEC.md).

The repository has two apps: `web/` (React + React Router v7, single-page app mode) and `api/` (NestJS + Prisma + PostgreSQL). Before changing routes, loaders or route types in `web/`, read the docs that ship with the installed version in `web/node_modules/react-router/docs/` and the agent skill in `.agents/skills/react-router/`. Do not apply patterns from other frameworks.

Do not run `git commit` or `git push` unless the owner asks in that message, and never add AI attribution (`Co-Authored-By`, "Generated with…") to commits or pull requests.
