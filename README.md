# Redliner

A browser-based drag racing game inspired by the [1980 Kenner Red Line](https://www.youtube.com/results?search_query=kenner+red+line+drag+racing) handheld electronic game. Built with TypeScript and HTML Canvas — no frameworks, no dependencies at runtime.

![Kenner Red Line reference](images/Screenshot%202026-02-16%20232750.png)

## How to Play

You're at the drag strip. The Christmas tree counts down — amber, amber, amber, GREEN — and you need to launch, shift through four gears, and cross the quarter-mile finish line before the AI does. Push too hard and you'll blow the engine. Jump the green and it's a foul.

### Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Gas | `Space` | Right side of screen |
| Shift up | `Shift` | Left side of screen |
| Mute/unmute | `M` | — |
| Menu navigate | `Arrow keys` | — |
| Select | `Enter` | — |
| Back | `Escape` | — |

### Tips

- **Don't over-rev.** Hold the gas too long in any gear and the engine blows. Shift before you hit the redline.
- **Reaction time matters.** The timer starts at green — the quicker you hit gas after the tree goes green, the better your ET.
- **Jump the light = foul.** If you gas it before green, you're disqualified.
- **Each gear climbs faster in lower gears.** First gear winds up quick, fourth gear is a slow build. Shift timing is everything.

## Car Classes

| Class | Target ET | Trap Speed | Redline |
|-------|----------|------------|---------|
| Stock | 13.5s | 105 mph | 6,500 RPM |
| Modified | 10.0s | 140 mph | 7,500 RPM |
| Funny Car | 7.0s | 195 mph | 8,500 RPM |
| Top Fuel | 5.0s | 260 mph | 9,500 RPM |

## AI Difficulty

| Level | Reaction Time | Description |
|-------|--------------|-------------|
| Rookie | ~600ms | Frequent mistakes, beatable by anyone |
| Amateur | ~400ms | Occasional errors, good challenge |
| Pro | ~250ms | Rare mistakes, demands precision |
| Legend | ~150ms | Near perfect, only the best win |

## Tech Stack

- **TypeScript** — strict mode, ES2022 target
- **Vite** — dev server and build tooling
- **HTML Canvas** — all rendering (tachometer, LED display, Christmas tree, effects)
- **Web Audio API** — synthesized engine sounds, shift clunks, tire screech, tree beeps
- **Zero runtime dependencies** — everything is hand-rolled

### Project Structure

```
redliner/
  client/               # Browser app (Vite entry)
    src/
      game.ts           # Game loop and state machine
      render/           # Canvas rendering (tachometer, LEDs, Christmas tree, effects)
      audio/            # Web Audio synthesis (engine, SFX)
      input/            # Keyboard + touch input handling
  shared/               # Shared between client and (future) server
    src/
      physics/          # Quarter-mile physics engine
      ai/               # AI driver with difficulty levels
  server/               # Multiplayer server (planned)
```

### Architecture

The project uses **npm workspaces** with three packages:

- **`shared`** — Physics engine and AI logic. Pure TypeScript, no DOM dependency. Designed to run on both client and server for future multiplayer.
- **`client`** — Canvas renderer, audio engine, input handling, and game loop. Imports from `@redliner/shared`.
- **`server`** — Planned multiplayer server (not yet implemented).

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node.js)

### Setup

```bash
# Clone the repo
git clone git@github.com:RidgetopAi/redliner.git
cd redliner

# Install all workspace dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser — the game loads immediately.

### Build for Production

```bash
npm run build
```

Output goes to `dist/client/`. Serve it with any static file server:

```bash
npx serve dist/client
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build shared + client + server for production |
| `npm run dev:server` | Start the multiplayer server (planned) |

### Project Layout

The project uses **npm workspaces** with three packages:

```
redliner/
  client/       # Browser app — Canvas renderer, audio, input, game loop
  shared/       # Physics engine + AI driver (runs on client and server)
  server/       # Multiplayer server (planned, uses ws)
```

`client` and `server` both import from `@redliner/shared` — the physics and AI logic are shared so multiplayer will use the same simulation on both ends.

## Roadmap

- [x] Single-player vs AI
- [x] 4 car classes with distinct physics profiles
- [x] 4 difficulty levels
- [x] Synthesized audio (engine, shifts, tree, win/lose)
- [x] Christmas tree countdown with foul detection
- [x] Touch controls for mobile
- [ ] Quick Match (online multiplayer)
- [ ] Room Code (private races)
