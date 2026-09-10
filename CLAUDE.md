# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A real-time collaborative Kanban board. Two independent, unlinked npm projects live side by side with no root `package.json` or workspace config:

- `client/` — React 19 + TypeScript app (Create React App / `react-scripts`), drag-and-drop board UI.
- `server/` — Express + Socket.IO + Mongoose backend, single MongoDB collection holding the whole board.

Always `cd` into the relevant subfolder before installing or running anything; there is nothing to run from the repo root.

## Commands

### Client (`client/`)
- Install: `yarn install` (repo has `yarn.lock`; a `package-lock.json` also exists, don't mix package managers)
- Dev server: `yarn start` (react-scripts, http://localhost:3000)
- Build: `yarn build`
- Tests: `yarn test` (CRA/Jest, launches in interactive watch mode)
  - Single file: `yarn test src/App.test.tsx`
  - Non-interactive single run (e.g. for CI/scripting): `CI=true yarn test`
- There is no separate lint command; ESLint runs via the `react-app` config baked into `react-scripts` (build/start/test all surface lint errors in the console).

### Server (`server/`)
- Install: `npm install`
- **No npm scripts are defined** in `server/package.json` — there is no `start`/`dev`/`build` command yet. The entry point is `server/server.ts`, and `tsconfig.server.json` (outDir `dist`) exists for compiling it. To run it today you must invoke `ts-node`/`tsc` directly, e.g. `npx ts-node server.ts`. Note `ts-node`/`typescript` are currently only declared as devDependencies in `client/package.json`, not `server/package.json` — you'll need to add them to `server/` (or install globally) before this works.
- The server listens on a hardcoded port: `4000`.

## Architecture

### Real-time sync model
The server is the single source of truth. All board mutations happen over Socket.IO, not REST:
- `board:init` — sent to a client on connect, full `BoardState` snapshot.
- `card:create`, `card:update`, `card:delete`, `card:move` — client emits a mutation, server applies it to MongoDB, then **broadcasts the same event to all connected clients** (`io.emit`, including the sender).
- Because the sender also receives its own broadcast back, `card:move` payloads carry a `senderId` (the emitting client's `socket.id`); `client/src/hooks/useBoard.ts` ignores incoming `card:move` events where `senderId === socket.id` to avoid double-applying its own optimistic update. The other three events don't do this dedup — keep that asymmetry in mind if you touch them.
- The only plain HTTP route is `GET /users` (`server/server.ts`), used by `client/src/hooks/useUsers.ts` to populate the avatar/filter row.

### Data model
- One single `Board` document (Mongoose model in `server/db/models/Board.ts`) stores the entire board as a loosely-typed nested `data` object: `{ cards: Record<id, Card>, columns: Record<id, Column>, columnOrder: string[] }`. The server auto-creates this document on boot (`initBoard` in `server.ts`) if none exists, with three fixed columns: `todo`, `inProgress`, `done`.
- `server/server.ts` reads/mutates `board.data` as `any` and writes the whole object back with `updateOne` on every mutation — there's no per-field update or optimistic concurrency; concurrent writes race.
- `User` is a separate, real Mongoose-typed collection (`server/db/models/User.ts`). Users are seeded once (`seedUsers` in `server.ts`) if the collection is empty. Cards reference a user via `assignedTo` (stored/passed as a string id, not populated).
- `server/types/index.ts` and `client/src/types/index.ts` independently define overlapping payload/shape types (`CreateCardPayload`, `Card`, `BoardState`, etc.) — there's no shared types package, so changing a socket payload shape means updating both sides by hand.

### Client state & drag-and-drop
- `client/src/hooks/useBoard.ts` owns all board state and all socket listeners; `App.tsx` just renders `Board` inside a `@dnd-kit` `DndContext` wired to this hook's `handleDragStart`/`handleDragOver`/`handleDragEnd`.
- `handleDragOver` mutates local state only, to preview a card moving across columns while dragging. `handleDragEnd` commits the final local reorder and emits `card:move` to the server. Both re-derive source/dest column by scanning `board.columns` for whichever column's `cardIds` contains the dragged/target id (`findColumn`), since drag events only carry element ids, not column ids.
- `client/src/hooks/useUsers.ts`'s `active` array is a client-local "filter by assignee" toggle (click an avatar in `User.tsx` to filter cards by `assignedTo`) — it is not presence/online-status and is not synced to the server or other clients.
- Column visuals (border/text color, hover tint) are index-based via `client/src/constants/color.tsx` (`columnColors`, `columnColorsOpacity`) applied by column position in `columnOrder`; card accent colors come from `neonColors`, keyed off a hash of the card id. The "add card" button is shown only on the column whose `title === "Todo"` (`Column.tsx`), i.e. it's matched by title string, not column id.

## Known quirks to be aware of

- `server/db/db.ts` has a MongoDB Atlas connection string (including credentials) hardcoded in source rather than read from an environment variable. Treat this as sensitive; don't propagate the pattern to new code, and flag it if asked to touch DB config.
- `client/package.json` lists `cors`, `express`, `mongoose`, and `socket.io` as client dependencies even though only `socket.io-client` is actually used by client code — likely leftover/copy-paste from the server's package.json.
- CORS on the server is fully open (`cors()` with no options, Socket.IO `origin: "*"`).
