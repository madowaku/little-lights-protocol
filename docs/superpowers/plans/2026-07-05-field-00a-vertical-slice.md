# Field 00-A Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Field 00-A so the player can move Lumi, connect a dotted Lightline, rescue the first Tiny Light, and reach ClearScene and ResultScene.

**Architecture:** Use a small Vite + TypeScript + Phaser app. Keep game rules in `src/game/simulation` and let Phaser scenes render state and dispatch actions. Use DOM overlays for story, briefing, clear, result, HUD, and command UI.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, DOM/CSS overlays, existing PNG assets.

---

## Scope

Implement only Field 00-A:

- StoryScene
- BriefingScene
- FieldScene
- ClearScene
- ResultScene
- Field 00-A nodes, edges, character data, dialogues, objectives
- Lumi selection
- Move
- Connect
- End Turn
- N03 arrival Tiny Light auto-rescue
- ClearScene / ResultScene transition

Do not implement:

- Repair
- Safe Place
- Scan
- Sync
- Split
- Enemy AI
- Failure state
- Growth
- Save data
- Field 00-B or later fields

## Premium Quality Direction

Field 00-A stays small, but every implementation choice should leave a path toward a paid mobile and Steam-quality game. The slice should avoid throwaway prototype habits that would make later polish expensive.

Build into this slice now:

- **Tactile clarity:** every successful action should have a visible response. Move tween, Connect pulse, and Tiny Light return are required.
- **Readable state language:** stable, weak, dotted, hidden, selected, and reachable states must be visually distinct at a glance.
- **Mobile-first command ergonomics:** command buttons must be large enough for touch and wrap cleanly at 390px width.
- **DOM text over canvas text for UI:** dialogue and commands must stay sharp on mobile and desktop.
- **Input abstraction:** UI dispatches semantic game actions, not Phaser-specific calls, so keyboard, controller, and touch can be added later.
- **Asset manifest discipline:** all game-consumed assets use stable keys so Steam/mobile packaging can remap paths later.
- **Reward moment:** Tiny Light rescue must feel like a tiny payoff, not just a state change.

Do not add yet:

- Audio implementation.
- Controller support.
- Steamworks integration.
- Mobile packaging.
- Save data.
- Achievements.
- Monetization.

Keep these as later premium backlog ideas:

- **Sound identity:** soft UI ticks, Lightline hums, and a tiny Core Lantern return motif.
- **Controller and keyboard parity:** D-pad/left stick target cycling, confirm/cancel, and command shortcuts.
- **Accessible tactical readability:** color plus shape/dash differences for every edge state.
- **Chapter map presentation:** a polished lantern-base field selector for mobile and Steam.
- **Replay motivation:** post-result note that hints at Field 00-B without grades or pressure.
- **Steam-quality pause shell:** settings, retry, text speed, audio sliders, and input remapping later.
- **Mobile haptics-ready action events:** semantic events for Move, Connect, rescue, clear, and result.

## Skills And Tools To Use During Execution

- Use `game-studio:phaser-2d-game` when implementing Phaser scene/runtime work.
- Use `frontend-design` when implementing the DOM HUD, command bar, dialogue, and result surfaces.
- Use `hiro-frontend-qa` after the UI is built to inspect desktop and mobile layouts.
- Use `game-studio:game-playtest` or Playwright after the vertical slice is runnable to verify the complete play path.
- Use `superpowers:verification-before-completion` before claiming the implementation is complete.

## File Map

Create:

- `package.json`: npm scripts and dependencies.
- `tsconfig.json`: TypeScript config.
- `vite.config.ts`: Vite and Vitest config.
- `index.html`: app mount point.
- `src/main.ts`: bootstraps Phaser and DOM UI.
- `src/style.css`: global game shell and overlay styling.
- `src/data/fields/field00A.ts`: Field 00-A authored data.
- `src/game/simulation/types.ts`: shared field, action, and state types.
- `src/game/simulation/state.ts`: initial state factory.
- `src/game/simulation/selectors.ts`: pure query helpers.
- `src/game/simulation/reducer.ts`: pure state transitions.
- `src/game/simulation/reducer.test.ts`: simulation unit tests.
- `src/game/assets/manifest.ts`: asset key and path mapping.
- `src/phaser/scenes/BootScene.ts`: preloads assets.
- `src/phaser/scenes/FieldScene.ts`: renders field and bridges pointer input to simulation.
- `src/phaser/view/fieldRenderer.ts`: draw/update nodes, edges, Lumi token, and highlights.
- `src/phaser/view/effects.ts`: small visual effects for connect and rescue.
- `src/ui/dom.ts`: DOM lookup and render helpers.
- `src/ui/dialogue.ts`: story/briefing/clear/result overlay rendering.
- `src/ui/hud.ts`: status/objective/hint rendering.
- `src/ui/commandBar.ts`: Move / Connect / End Turn command rendering.
- `src/ui/result.ts`: result content rendering.

Modify:

- `.gitignore`: ensure build/test outputs remain ignored if not already present.

## Data Model

Use these core types:

```ts
export type GameScene = "story" | "briefing" | "field" | "clear" | "result";
export type NodeType = "core" | "relay" | "empty" | "tinyLight" | "memory";
export type NodeState = "stable" | "weak" | "unlinked" | "dormant" | "hidden";
export type EdgeState = "stable" | "weak" | "dotted" | "hidden" | "temporary";
export type CharacterId = "lumi";

export type FieldNode = {
  id: string;
  name: string;
  jpName: string;
  type: NodeType;
  state: NodeState;
  x: number;
  y: number;
  description: string;
  rescued?: boolean;
};

export type FieldEdge = {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
};

export type CharacterUnit = {
  id: CharacterId;
  name: string;
  jpName: string;
  currentNodeId: string;
  actionsUsedThisTurn: boolean;
};

export type GameState = {
  scene: GameScene;
  turn: number;
  nodes: FieldNode[];
  edges: FieldEdge[];
  characters: CharacterUnit[];
  selectedCharacterId?: CharacterId;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  rescuedTinyLights: string[];
  learnedActions: string[];
  hint: string;
};
```

## Task 1: Scaffold Vite, TypeScript, Phaser, And Vitest

**Files:**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/style.css`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

Use this content:

```json
{
  "name": "little-lights-protocol",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "@vitejs/plugin-basic-ssl": "^2.1.0",
    "typescript": "^5.8.3",
    "vite": "^7.0.0",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

Use this content:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

Use this content:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 4: Create `index.html`**

Use this content:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Little Lights Protocol - Field 00-A</title>
  </head>
  <body>
    <div id="app">
      <div id="game-root"></div>
      <div id="ui-root"></div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: Create minimal bootstrap `src/main.ts`**

Use this content:

```ts
import "./style.css";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

if (!gameRoot || !uiRoot) {
  throw new Error("Missing #game-root or #ui-root");
}

uiRoot.innerHTML = `<div class="boot-message">Little Lights Protocol is booting...</div>`;
```

- [ ] **Step 6: Create `src/style.css`**

Use this content:

```css
:root {
  color: #f8fbff;
  background: #07111f;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  overflow: hidden;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background:
    radial-gradient(circle at 35% 30%, rgba(86, 229, 255, 0.16), transparent 28%),
    radial-gradient(circle at 70% 20%, rgba(255, 222, 128, 0.12), transparent 24%),
    linear-gradient(180deg, #07111f 0%, #101827 100%);
}

#game-root,
#ui-root {
  position: absolute;
  inset: 0;
}

#ui-root {
  pointer-events: none;
}

.boot-message {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #dffaff;
}
```

- [ ] **Step 7: Ensure `.gitignore` contains build outputs**

Confirm these lines exist:

```text
node_modules/
dist/
.vite/
coverage/
*.log
```

- [ ] **Step 8: Install dependencies**

Run:

```bash
npm install
```

Expected: `node_modules/` and `package-lock.json` are created.

- [ ] **Step 9: Run scaffold checks**

Run:

```bash
npm run build
npm test
```

Expected:

- `npm run build` passes.
- `npm test` reports no tests found or passes if Vitest exits cleanly after test files exist.

- [ ] **Step 10: Commit scaffold**

Run:

```bash
git add .gitignore index.html package.json package-lock.json tsconfig.json vite.config.ts src/main.ts src/style.css
git commit -m "chore: scaffold phaser field prototype"
```

## Task 2: Add Field 00-A Data And Simulation Types

**Files:**

- Create: `src/game/simulation/types.ts`
- Create: `src/data/fields/field00A.ts`
- Create: `src/game/simulation/state.ts`
- Create: `src/game/simulation/selectors.ts`
- Create: `src/game/simulation/selectors.test.ts`

- [ ] **Step 1: Create simulation types**

Create `src/game/simulation/types.ts`:

```ts
export type GameScene = "story" | "briefing" | "field" | "clear" | "result";
export type NodeType = "core" | "relay" | "empty" | "tinyLight" | "memory";
export type NodeState = "stable" | "weak" | "unlinked" | "dormant" | "hidden";
export type EdgeState = "stable" | "weak" | "dotted" | "hidden" | "temporary";
export type CharacterId = "lumi";
export type LearnedAction = "Move" | "Connect";

export type FieldNode = {
  id: string;
  name: string;
  jpName: string;
  type: NodeType;
  state: NodeState;
  x: number;
  y: number;
  description: string;
  rescued?: boolean;
};

export type FieldEdge = {
  id: string;
  from: string;
  to: string;
  state: EdgeState;
};

export type CharacterUnit = {
  id: CharacterId;
  name: string;
  jpName: string;
  currentNodeId: string;
  actionsUsedThisTurn: boolean;
};

export type DialogueLine = {
  speaker: string;
  text: string;
};

export type FieldObjective = {
  id: string;
  text: string;
  complete: boolean;
};

export type FieldDefinition = {
  id: "field00A";
  title: string;
  subtitle: string;
  nodes: FieldNode[];
  edges: FieldEdge[];
  characters: CharacterUnit[];
  story: DialogueLine[];
  briefing: DialogueLine[];
  clear: DialogueLine[];
  objectives: FieldObjective[];
};

export type GameState = {
  scene: GameScene;
  turn: number;
  nodes: FieldNode[];
  edges: FieldEdge[];
  characters: CharacterUnit[];
  selectedCharacterId?: CharacterId;
  selectedNodeId?: string;
  selectedEdgeId?: string;
  rescuedTinyLights: string[];
  learnedActions: LearnedAction[];
  objectives: FieldObjective[];
  hint: string;
};
```

- [ ] **Step 2: Create Field 00-A authored data**

Create `src/data/fields/field00A.ts`:

```ts
import type { FieldDefinition } from "../../game/simulation/types";

export const field00A: FieldDefinition = {
  id: "field00A",
  title: "Field 00-A",
  subtitle: "最初の灯り",
  nodes: [
    {
      id: "N00",
      name: "Core Lantern",
      jpName: "コア・ランタン",
      type: "core",
      state: "stable",
      x: 120,
      y: 470,
      description: "ルミが目を覚ました場所。Lightlineの起点。",
    },
    {
      id: "N01",
      name: "Faint Relay",
      jpName: "かすかなリレー",
      type: "relay",
      state: "weak",
      x: 300,
      y: 470,
      description: "最初に光が届く中継点。",
    },
    {
      id: "N02",
      name: "Dotted Street",
      jpName: "点線の通り",
      type: "empty",
      state: "unlinked",
      x: 480,
      y: 470,
      description: "まだ光が通っていない道の先。",
    },
    {
      id: "N03",
      name: "First Tiny Light",
      jpName: "最初の灯り",
      type: "tinyLight",
      state: "weak",
      x: 660,
      y: 470,
      rescued: false,
      description: "消えかけている小さな灯り。",
    },
    {
      id: "N04",
      name: "Old Bench",
      jpName: "古いベンチ",
      type: "empty",
      state: "dormant",
      x: 480,
      y: 310,
      description: "誰かが待っていたような古いベンチ。",
    },
    {
      id: "N05",
      name: "Memory Sign",
      jpName: "かすれた標識",
      type: "memory",
      state: "dormant",
      x: 480,
      y: 160,
      description: "文字が読めなくなった標識。",
    },
  ],
  edges: [
    { id: "E00", from: "N00", to: "N01", state: "stable" },
    { id: "E01", from: "N01", to: "N02", state: "dotted" },
    { id: "E02", from: "N02", to: "N03", state: "weak" },
    { id: "E03", from: "N02", to: "N04", state: "dotted" },
    { id: "E04", from: "N04", to: "N05", state: "hidden" },
  ],
  characters: [
    {
      id: "lumi",
      name: "Lumi",
      jpName: "ルミ",
      currentNodeId: "N00",
      actionsUsedThisTurn: false,
    },
  ],
  story: [
    { speaker: "ルミ", text: "……聞こえる。" },
    { speaker: "Pico", text: "ピコ" },
    { speaker: "ルミ", text: "まだ、消えてない。" },
    { speaker: "ルミ", text: "だったら、迎えに行こう。" },
  ],
  briefing: [
    { speaker: "ルミ", text: "あそこまで、光をつなげばいいんだね。" },
    { speaker: "Pico", text: "ピコ" },
    { speaker: "ルミ", text: "うん。やってみる。" },
  ],
  clear: [
    { speaker: "ルミ", text: "戻ってきた。" },
    { speaker: "Pico", text: "ピコ！" },
    { speaker: "ルミ", text: "うん。ちゃんと、届いたね。" },
  ],
  objectives: [
    { id: "rescue-n03", text: "最初の灯りを迎えに行く", complete: false },
  ],
};
```

- [ ] **Step 3: Create initial state factory**

Create `src/game/simulation/state.ts`:

```ts
import { field00A } from "../../data/fields/field00A";
import type { GameState } from "./types";

export function createInitialState(): GameState {
  return {
    scene: "story",
    turn: 1,
    nodes: structuredClone(field00A.nodes),
    edges: structuredClone(field00A.edges),
    characters: structuredClone(field00A.characters),
    selectedCharacterId: "lumi",
    selectedNodeId: "N00",
    rescuedTinyLights: [],
    learnedActions: [],
    objectives: structuredClone(field00A.objectives),
    hint: "ルミを選んで、光の届く場所へ移動しよう。",
  };
}
```

- [ ] **Step 4: Create selectors**

Create `src/game/simulation/selectors.ts`:

```ts
import type { CharacterId, FieldEdge, FieldNode, GameState } from "./types";

export function getNode(state: GameState, nodeId: string): FieldNode | undefined {
  return state.nodes.find((node) => node.id === nodeId);
}

export function getEdge(state: GameState, edgeId: string): FieldEdge | undefined {
  return state.edges.find((edge) => edge.id === edgeId);
}

export function getCharacter(state: GameState, characterId: CharacterId) {
  return state.characters.find((character) => character.id === characterId);
}

export function getEdgesForNode(state: GameState, nodeId: string): FieldEdge[] {
  return state.edges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
}

export function getOtherNodeId(edge: FieldEdge, nodeId: string): string | undefined {
  if (edge.from === nodeId) return edge.to;
  if (edge.to === nodeId) return edge.from;
  return undefined;
}

export function isMoveEdge(edge: FieldEdge): boolean {
  return edge.state === "stable" || edge.state === "weak" || edge.state === "temporary";
}

export function isConnectEdge(edge: FieldEdge): boolean {
  return edge.state === "dotted" || edge.state === "weak";
}

export function getMoveTargets(state: GameState, characterId: CharacterId): string[] {
  const character = getCharacter(state, characterId);
  if (!character || character.actionsUsedThisTurn) return [];

  return getEdgesForNode(state, character.currentNodeId)
    .filter(isMoveEdge)
    .map((edge) => getOtherNodeId(edge, character.currentNodeId))
    .filter((nodeId): nodeId is string => Boolean(nodeId));
}

export function getConnectTargets(state: GameState, characterId: CharacterId): string[] {
  const character = getCharacter(state, characterId);
  if (!character || character.id !== "lumi" || character.actionsUsedThisTurn) return [];

  return getEdgesForNode(state, character.currentNodeId)
    .filter(isConnectEdge)
    .map((edge) => edge.id);
}
```

- [ ] **Step 5: Write selector tests**

Create `src/game/simulation/selectors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { getConnectTargets, getMoveTargets, isConnectEdge, isMoveEdge } from "./selectors";

describe("Field 00-A selectors", () => {
  it("allows movement across stable and weak edges only", () => {
    expect(isMoveEdge({ id: "stable", from: "A", to: "B", state: "stable" })).toBe(true);
    expect(isMoveEdge({ id: "weak", from: "A", to: "B", state: "weak" })).toBe(true);
    expect(isMoveEdge({ id: "dotted", from: "A", to: "B", state: "dotted" })).toBe(false);
    expect(isMoveEdge({ id: "hidden", from: "A", to: "B", state: "hidden" })).toBe(false);
  });

  it("allows connect on dotted and weak edges", () => {
    expect(isConnectEdge({ id: "dotted", from: "A", to: "B", state: "dotted" })).toBe(true);
    expect(isConnectEdge({ id: "weak", from: "A", to: "B", state: "weak" })).toBe(true);
    expect(isConnectEdge({ id: "stable", from: "A", to: "B", state: "stable" })).toBe(false);
  });

  it("starts Lumi at N00 with N01 as the only move target", () => {
    const state = createInitialState();
    expect(getMoveTargets(state, "lumi")).toEqual(["N01"]);
    expect(getConnectTargets(state, "lumi")).toEqual([]);
  });
});
```

- [ ] **Step 6: Run selector tests**

Run:

```bash
npm test -- src/game/simulation/selectors.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit data and selectors**

Run:

```bash
git add src/data/fields/field00A.ts src/game/simulation/types.ts src/game/simulation/state.ts src/game/simulation/selectors.ts src/game/simulation/selectors.test.ts
git commit -m "feat: add field 00a data model"
```

## Task 3: Implement Simulation Reducer

**Files:**

- Create: `src/game/simulation/reducer.ts`
- Create: `src/game/simulation/reducer.test.ts`

- [ ] **Step 1: Create reducer tests first**

Create `src/game/simulation/reducer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { reduceGame } from "./reducer";

describe("Field 00-A reducer", () => {
  it("advances scene from story to briefing to field", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    expect(state.scene).toBe("briefing");
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    expect(state.scene).toBe("field");
  });

  it("moves Lumi from N00 to N01 over stable edge E00", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N01" });

    expect(state.characters[0].currentNodeId).toBe("N01");
    expect(state.characters[0].actionsUsedThisTurn).toBe(true);
    expect(state.hint).toContain("点線");
  });

  it("does not move Lumi across dotted edge E01 before Connect", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N01" });
    state = reduceGame(state, { type: "END_TURN" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N02" });

    expect(state.characters[0].currentNodeId).toBe("N01");
    expect(state.hint).toContain("Connect");
  });

  it("connects E01 from dotted to weak", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N01" });
    state = reduceGame(state, { type: "END_TURN" });
    state = reduceGame(state, { type: "CONNECT", characterId: "lumi", edgeId: "E01" });

    expect(state.edges.find((edge) => edge.id === "E01")?.state).toBe("weak");
    expect(state.learnedActions).toContain("Connect");
  });

  it("rescues N03 and moves to clear scene when Lumi reaches the Tiny Light", () => {
    let state = createInitialState();
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "ADVANCE_SCENE" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N01" });
    state = reduceGame(state, { type: "END_TURN" });
    state = reduceGame(state, { type: "CONNECT", characterId: "lumi", edgeId: "E01" });
    state = reduceGame(state, { type: "END_TURN" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N02" });
    state = reduceGame(state, { type: "END_TURN" });
    state = reduceGame(state, { type: "MOVE", characterId: "lumi", toNodeId: "N03" });

    expect(state.scene).toBe("clear");
    expect(state.rescuedTinyLights).toEqual(["N03"]);
    expect(state.objectives[0].complete).toBe(true);
  });

  it("advances from clear to result", () => {
    const state = reduceGame({ ...createInitialState(), scene: "clear" }, { type: "ADVANCE_SCENE" });
    expect(state.scene).toBe("result");
  });
});
```

- [ ] **Step 2: Run reducer tests to verify failure**

Run:

```bash
npm test -- src/game/simulation/reducer.test.ts
```

Expected: fails because `reducer.ts` does not exist.

- [ ] **Step 3: Implement reducer**

Create `src/game/simulation/reducer.ts`:

```ts
import { getCharacter, getEdge, getMoveTargets, getNode, isConnectEdge } from "./selectors";
import type { CharacterId, GameState, LearnedAction } from "./types";

export type GameAction =
  | { type: "ADVANCE_SCENE" }
  | { type: "SELECT_CHARACTER"; characterId: CharacterId }
  | { type: "SELECT_NODE"; nodeId: string }
  | { type: "SELECT_EDGE"; edgeId: string }
  | { type: "MOVE"; characterId: CharacterId; toNodeId: string }
  | { type: "CONNECT"; characterId: CharacterId; edgeId: string }
  | { type: "END_TURN" };

function addLearnedAction(state: GameState, action: LearnedAction): LearnedAction[] {
  return state.learnedActions.includes(action)
    ? state.learnedActions
    : [...state.learnedActions, action];
}

function rescueTinyLight(state: GameState, nodeId: string): GameState {
  const node = getNode(state, nodeId);
  if (!node || node.type !== "tinyLight" || state.rescuedTinyLights.includes(nodeId)) {
    return state;
  }

  return {
    ...state,
    scene: "clear",
    nodes: state.nodes.map((item) =>
      item.id === nodeId ? { ...item, rescued: true, state: "stable" } : item,
    ),
    objectives: state.objectives.map((objective) =>
      objective.id === "rescue-n03" ? { ...objective, complete: true } : objective,
    ),
    rescuedTinyLights: [...state.rescuedTinyLights, nodeId],
    hint: "最初の灯りがコア・ランタンへ戻っていく。",
  };
}

export function reduceGame(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADVANCE_SCENE": {
      if (state.scene === "story") return { ...state, scene: "briefing" };
      if (state.scene === "briefing") return { ...state, scene: "field" };
      if (state.scene === "clear") return { ...state, scene: "result" };
      return state;
    }

    case "SELECT_CHARACTER":
      return {
        ...state,
        selectedCharacterId: action.characterId,
        selectedNodeId: getCharacter(state, action.characterId)?.currentNodeId ?? state.selectedNodeId,
      };

    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.nodeId };

    case "SELECT_EDGE":
      return { ...state, selectedEdgeId: action.edgeId };

    case "MOVE": {
      if (state.scene !== "field") return state;
      const character = getCharacter(state, action.characterId);
      if (!character || character.actionsUsedThisTurn) return state;

      const moveTargets = getMoveTargets(state, action.characterId);
      if (!moveTargets.includes(action.toNodeId)) {
        return {
          ...state,
          hint: "この道はまだ進めません。先にConnectで光を通しましょう。",
        };
      }

      const movedState: GameState = {
        ...state,
        selectedCharacterId: action.characterId,
        selectedNodeId: action.toNodeId,
        characters: state.characters.map((item) =>
          item.id === action.characterId
            ? { ...item, currentNodeId: action.toNodeId, actionsUsedThisTurn: true }
            : item,
        ),
        learnedActions: addLearnedAction(state, "Move"),
        hint:
          action.toNodeId === "N01"
            ? "点線の道は、ルミのConnectで光を通せます。"
            : "つながった道を進んで、灯りに近づこう。",
      };

      return rescueTinyLight(movedState, action.toNodeId);
    }

    case "CONNECT": {
      if (state.scene !== "field") return state;
      const character = getCharacter(state, action.characterId);
      const edge = getEdge(state, action.edgeId);
      if (!character || !edge || character.id !== "lumi" || character.actionsUsedThisTurn) {
        return state;
      }
      if (edge.from !== character.currentNodeId && edge.to !== character.currentNodeId) {
        return {
          ...state,
          hint: "ルミはそのLightlineのそばに立つ必要があります。",
        };
      }
      if (!isConnectEdge(edge)) {
        return {
          ...state,
          hint: "このLightlineは今Connect対象ではありません。",
        };
      }

      const nextEdgeState = edge.state === "dotted" ? "weak" : "stable";

      return {
        ...state,
        edges: state.edges.map((item) =>
          item.id === action.edgeId ? { ...item, state: nextEdgeState } : item,
        ),
        characters: state.characters.map((item) =>
          item.id === action.characterId ? { ...item, actionsUsedThisTurn: true } : item,
        ),
        selectedEdgeId: action.edgeId,
        learnedActions: addLearnedAction(state, "Connect"),
        hint: "道が見えた。つながった道を進んで、灯りに近づこう。",
      };
    }

    case "END_TURN":
      if (state.scene !== "field") return state;
      return {
        ...state,
        turn: state.turn + 1,
        characters: state.characters.map((character) => ({
          ...character,
          actionsUsedThisTurn: false,
        })),
        hint: "次の行動を選びましょう。",
      };

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run reducer tests**

Run:

```bash
npm test -- src/game/simulation/reducer.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Run all simulation tests**

Run:

```bash
npm test -- src/game/simulation
```

Expected: all tests pass.

- [ ] **Step 6: Commit reducer**

Run:

```bash
git add src/game/simulation/reducer.ts src/game/simulation/reducer.test.ts
git commit -m "feat: implement field 00a simulation"
```

## Task 4: Add Asset Manifest And Phaser Boot

**Files:**

- Create: `src/game/assets/manifest.ts`
- Create: `src/phaser/scenes/BootScene.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create asset manifest**

Create `src/game/assets/manifest.ts`:

```ts
export const assetKeys = {
  lumiChibi: "lumi-chibi",
} as const;

export const assetPaths = {
  [assetKeys.lumiChibi]: "/assets/characters/lumi/chibi/lumi_chibi_idle.png",
} as const;
```

- [ ] **Step 2: Create BootScene**

Create `src/phaser/scenes/BootScene.ts`:

```ts
import Phaser from "phaser";
import { assetKeys, assetPaths } from "../../game/assets/manifest";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.image(assetKeys.lumiChibi, assetPaths[assetKeys.lumiChibi]);
  }

  create(): void {
    this.scene.start("FieldScene");
  }
}
```

- [ ] **Step 3: Temporarily wire Phaser with BootScene**

Modify `src/main.ts`:

```ts
import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./phaser/scenes/BootScene";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

if (!gameRoot || !uiRoot) {
  throw new Error("Missing #game-root or #ui-root");
}

uiRoot.innerHTML = `<div class="boot-message">Little Lights Protocol is booting...</div>`;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  backgroundColor: "#07111f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene],
});
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build fails because `FieldScene` is not registered yet after BootScene tries to start it at runtime only if opened, but TypeScript build passes. If TypeScript fails because of missing imports, fix imports before continuing.

- [ ] **Step 5: Commit asset and boot setup**

Run:

```bash
git add src/game/assets/manifest.ts src/phaser/scenes/BootScene.ts src/main.ts
git commit -m "feat: preload field assets"
```

## Task 5: Render Field Map In Phaser

**Files:**

- Create: `src/phaser/view/fieldRenderer.ts`
- Create: `src/phaser/scenes/FieldScene.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create renderer helpers**

Create `src/phaser/view/fieldRenderer.ts`:

```ts
import Phaser from "phaser";
import { assetKeys } from "../../game/assets/manifest";
import type { FieldEdge, FieldNode, GameState } from "../../game/simulation/types";

const edgeColors: Record<string, number> = {
  stable: 0x66f7ff,
  weak: 0xffdf7a,
  dotted: 0xd8cbff,
  hidden: 0x445067,
  temporary: 0x9fffc8,
};

const nodeColors: Record<string, number> = {
  stable: 0x66f7ff,
  weak: 0xffdf7a,
  unlinked: 0xaab7c8,
  dormant: 0x6d7788,
  hidden: 0x445067,
};

export type RenderedField = {
  edges: Map<string, Phaser.GameObjects.Line>;
  nodes: Map<string, Phaser.GameObjects.Container>;
  lumi?: Phaser.GameObjects.Image;
};

export function drawField(scene: Phaser.Scene, state: GameState): RenderedField {
  const rendered: RenderedField = {
    edges: new Map(),
    nodes: new Map(),
  };

  const nodeById = new Map(state.nodes.map((node) => [node.id, node]));

  for (const edge of state.edges) {
    const from = nodeById.get(edge.from);
    const to = nodeById.get(edge.to);
    if (!from || !to) continue;

    const line = scene.add.line(0, 0, from.x, from.y, to.x, to.y, edgeColors[edge.state] ?? 0xffffff);
    line.setOrigin(0, 0);
    line.setLineWidth(edge.state === "stable" ? 5 : 3);
    line.setAlpha(edge.state === "hidden" ? 0.18 : 0.86);
    line.setData("edgeState", edge.state);
    if (edge.state === "dotted" || edge.state === "hidden") {
      line.setStrokeStyle(edge.state === "dotted" ? 3 : 2, edgeColors[edge.state] ?? 0xffffff, 0.7);
    }
    rendered.edges.set(edge.id, line);
  }

  for (const node of state.nodes) {
    const container = scene.add.container(node.x, node.y);
    const color = nodeColors[node.state] ?? 0xffffff;
    const ring = scene.add.circle(0, 0, node.type === "core" ? 31 : 25, 0x07111f, 0.94);
    ring.setStrokeStyle(node.type === "core" ? 4 : 3, color, node.state === "hidden" ? 0.3 : 0.95);
    const core = scene.add.circle(0, 0, node.type === "tinyLight" ? 9 : 11, color, node.state === "hidden" ? 0.2 : 0.78);
    const label = scene.add.text(30, -10, `${node.id} ${node.jpName}`, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      color: "#e8f7ff",
    });
    container.add([ring, core, label]);
    container.setSize(64, 64);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, 34), Phaser.Geom.Circle.Contains);
    container.setData("nodeId", node.id);
    rendered.nodes.set(node.id, container);
  }

  const lumi = state.characters.find((character) => character.id === "lumi");
  const lumiNode = lumi ? nodeById.get(lumi.currentNodeId) : undefined;
  if (lumiNode) {
    rendered.lumi = scene.add.image(lumiNode.x, lumiNode.y - 38, assetKeys.lumiChibi);
    rendered.lumi.setDisplaySize(78, 78);
    rendered.lumi.setDepth(20);
  }

  return rendered;
}

export function updateField(scene: Phaser.Scene, rendered: RenderedField, state: GameState): void {
  const nodeById = new Map(state.nodes.map((node) => [node.id, node]));

  for (const edge of state.edges) {
    const line = rendered.edges.get(edge.id);
    if (!line) continue;
    line.setStrokeStyle(edge.state === "stable" ? 5 : 3, edgeColors[edge.state] ?? 0xffffff, edge.state === "hidden" ? 0.18 : 0.86);
    line.setData("edgeState", edge.state);
  }

  const lumi = state.characters.find((character) => character.id === "lumi");
  const lumiNode = lumi ? nodeById.get(lumi.currentNodeId) : undefined;
  if (rendered.lumi && lumiNode) {
    scene.tweens.add({
      targets: rendered.lumi,
      x: lumiNode.x,
      y: lumiNode.y - 38,
      duration: 220,
      ease: "Sine.easeOut",
    });
  }
}
```

- [ ] **Step 2: Create FieldScene**

Create `src/phaser/scenes/FieldScene.ts`:

```ts
import Phaser from "phaser";
import { createInitialState } from "../../game/simulation/state";
import { reduceGame, type GameAction } from "../../game/simulation/reducer";
import type { GameState } from "../../game/simulation/types";
import { drawField, updateField, type RenderedField } from "../view/fieldRenderer";

export class FieldScene extends Phaser.Scene {
  private state!: GameState;
  private rendered?: RenderedField;

  constructor() {
    super("FieldScene");
  }

  create(): void {
    this.state = createInitialState();
    this.drawBackground();
    this.rendered = drawField(this, this.state);

    for (const [, nodeContainer] of this.rendered.nodes) {
      nodeContainer.on("pointerdown", () => {
        const nodeId = nodeContainer.getData("nodeId") as string;
        this.dispatch({ type: "SELECT_NODE", nodeId });
      });
    }

    window.dispatchEvent(new CustomEvent("llp:state", { detail: this.state }));
    window.addEventListener("llp:action", this.handleDomAction);
  }

  shutdown(): void {
    window.removeEventListener("llp:action", this.handleDomAction);
  }

  private handleDomAction = (event: Event): void => {
    const customEvent = event as CustomEvent<GameAction>;
    this.dispatch(customEvent.detail);
  };

  private dispatch(action: GameAction): void {
    this.state = reduceGame(this.state, action);
    if (this.rendered) {
      updateField(this, this.rendered, this.state);
    }
    window.dispatchEvent(new CustomEvent("llp:state", { detail: this.state }));
  }

  private drawBackground(): void {
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x07111f).setOrigin(0);
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1f3a4a, 0.25);
    for (let x = 80; x < this.scale.width; x += 80) {
      graphics.lineBetween(x, 80, x, this.scale.height - 80);
    }
    for (let y = 80; y < this.scale.height; y += 80) {
      graphics.lineBetween(80, y, this.scale.width - 80, y);
    }
  }
}
```

- [ ] **Step 3: Register FieldScene in main**

Modify `src/main.ts`:

```ts
import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./phaser/scenes/BootScene";
import { FieldScene } from "./phaser/scenes/FieldScene";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

if (!gameRoot || !uiRoot) {
  throw new Error("Missing #game-root or #ui-root");
}

uiRoot.innerHTML = `<div class="boot-message">Little Lights Protocol is booting...</div>`;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  backgroundColor: "#07111f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene, FieldScene],
});
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 5: Commit Phaser rendering**

Run:

```bash
git add src/phaser/view/fieldRenderer.ts src/phaser/scenes/FieldScene.ts src/main.ts
git commit -m "feat: render field 00a board"
```

## Task 6: Add DOM UI Overlays And Commands

**Files:**

- Create: `src/ui/dom.ts`
- Create: `src/ui/dialogue.ts`
- Create: `src/ui/hud.ts`
- Create: `src/ui/commandBar.ts`
- Create: `src/ui/result.ts`
- Modify: `src/main.ts`
- Modify: `src/style.css`

- [ ] **Step 1: Create DOM render helper**

Create `src/ui/dom.ts`:

```ts
import type { GameAction } from "../game/simulation/reducer";
import type { GameState } from "../game/simulation/types";
import { renderCommandBar } from "./commandBar";
import { renderDialogue } from "./dialogue";
import { renderHud } from "./hud";
import { renderResult } from "./result";

export function dispatchGameAction(action: GameAction): void {
  window.dispatchEvent(new CustomEvent("llp:action", { detail: action }));
}

export function renderUi(root: HTMLElement, state: GameState): void {
  root.innerHTML = `
    ${renderHud(state)}
    ${renderCommandBar(state)}
    ${renderDialogue(state)}
    ${renderResult(state)}
  `;

  root.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const action = element.dataset.action;
      const nodeId = element.dataset.nodeId;
      const edgeId = element.dataset.edgeId;
      if (action === "advance") dispatchGameAction({ type: "ADVANCE_SCENE" });
      if (action === "end-turn") dispatchGameAction({ type: "END_TURN" });
      if (action === "move" && nodeId) dispatchGameAction({ type: "MOVE", characterId: "lumi", toNodeId: nodeId });
      if (action === "connect" && edgeId) dispatchGameAction({ type: "CONNECT", characterId: "lumi", edgeId });
    });
  });
}
```

- [ ] **Step 2: Create dialogue overlay renderer**

Create `src/ui/dialogue.ts`:

```ts
import { field00A } from "../data/fields/field00A";
import type { DialogueLine, GameState } from "../game/simulation/types";

function linesForScene(scene: GameState["scene"]): DialogueLine[] {
  if (scene === "story") return field00A.story;
  if (scene === "briefing") return field00A.briefing;
  if (scene === "clear") return field00A.clear;
  return [];
}

export function renderDialogue(state: GameState): string {
  const lines = linesForScene(state.scene);
  if (lines.length === 0) return "";
  const body = lines
    .map((line) => `<p><strong>${line.speaker}</strong><span>${line.text}</span></p>`)
    .join("");

  const label = state.scene === "story" ? "Story" : state.scene === "briefing" ? "Briefing" : "Clear";
  const button = state.scene === "clear" ? "Resultへ" : "次へ";

  return `
    <section class="dialogue-overlay">
      <div class="dialogue-panel">
        <div class="eyebrow">${label}</div>
        <div class="dialogue-lines">${body}</div>
        <button class="primary-button" data-action="advance">${button}</button>
      </div>
    </section>
  `;
}
```

- [ ] **Step 3: Create HUD renderer**

Create `src/ui/hud.ts`:

```ts
import { field00A } from "../data/fields/field00A";
import type { GameState } from "../game/simulation/types";

export function renderHud(state: GameState): string {
  const character = state.characters[0];
  const objective = state.objectives[0];

  return `
    <header class="hud">
      <div>
        <div class="hud-title">${field00A.title}</div>
        <div class="hud-subtitle">${field00A.subtitle}</div>
      </div>
      <div class="hud-status">
        <span>Turn ${state.turn}</span>
        <span>${character.jpName}: ${character.currentNodeId}</span>
        <span>${objective.complete ? "✓" : "○"} ${objective.text}</span>
      </div>
      <div class="hud-hint">${state.hint}</div>
    </header>
  `;
}
```

- [ ] **Step 4: Create command bar renderer**

Create `src/ui/commandBar.ts`:

```ts
import { getConnectTargets, getMoveTargets } from "../game/simulation/selectors";
import type { GameState } from "../game/simulation/types";

export function renderCommandBar(state: GameState): string {
  if (state.scene !== "field") return "";

  const moveTargets = getMoveTargets(state, "lumi");
  const connectTargets = getConnectTargets(state, "lumi");

  const moveButtons = moveTargets
    .map((nodeId) => `<button class="command-button" data-action="move" data-node-id="${nodeId}">Move ${nodeId}</button>`)
    .join("");

  const connectButtons = connectTargets
    .map((edgeId) => `<button class="command-button connect" data-action="connect" data-edge-id="${edgeId}">Connect ${edgeId}</button>`)
    .join("");

  return `
    <nav class="command-bar">
      ${moveButtons}
      ${connectButtons}
      <button class="command-button subtle" data-action="end-turn">End Turn</button>
    </nav>
  `;
}
```

- [ ] **Step 5: Create result renderer**

Create `src/ui/result.ts`:

```ts
import type { GameState } from "../game/simulation/types";

export function renderResult(state: GameState): string {
  if (state.scene !== "result") return "";

  return `
    <section class="dialogue-overlay">
      <div class="result-panel">
        <div class="eyebrow">Result</div>
        <h1>Field 00-A Clear</h1>
        <dl>
          <div><dt>戻った灯り</dt><dd>${state.rescuedTinyLights.length}</dd></div>
          <div><dt>覚えたアクション</dt><dd>${state.learnedActions.join(" / ")}</dd></div>
          <div><dt>新しい仲間</dt><dd>ルミ & Pico</dd></div>
        </dl>
        <p>光をつなぐと、消えかけた灯りを迎えに行ける。</p>
        <p class="next-field">次へ: Field 00-B 戻れる場所</p>
      </div>
    </section>
  `;
}
```

- [ ] **Step 6: Wire UI updates in `main.ts`**

Modify `src/main.ts`:

```ts
import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./phaser/scenes/BootScene";
import { FieldScene } from "./phaser/scenes/FieldScene";
import { renderUi } from "./ui/dom";
import type { GameState } from "./game/simulation/types";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root");

if (!gameRoot || !uiRoot) {
  throw new Error("Missing #game-root or #ui-root");
}

window.addEventListener("llp:state", (event) => {
  const customEvent = event as CustomEvent<GameState>;
  renderUi(uiRoot, customEvent.detail);
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  backgroundColor: "#07111f",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene, FieldScene],
});
```

- [ ] **Step 7: Add UI CSS**

Append to `src/style.css`:

```css
.hud {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: grid;
  grid-template-columns: minmax(160px, 260px) 1fr;
  gap: 12px 20px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid rgba(117, 231, 255, 0.24);
  background: rgba(5, 13, 28, 0.74);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  pointer-events: auto;
}

.hud-title {
  font-size: 18px;
  font-weight: 800;
}

.hud-subtitle,
.hud-status,
.hud-hint {
  color: #c8d8e8;
  font-size: 13px;
}

.hud-status {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hud-hint {
  grid-column: 1 / -1;
  color: #ffe6a3;
}

.command-bar {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(117, 231, 255, 0.22);
  border-radius: 8px;
  background: rgba(5, 13, 28, 0.78);
  pointer-events: auto;
}

.command-button,
.primary-button {
  min-height: 44px;
  min-width: 96px;
  border: 1px solid rgba(148, 235, 255, 0.36);
  color: #f8fbff;
  background: rgba(24, 72, 96, 0.86);
  border-radius: 8px;
  padding: 10px 14px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.command-button.connect {
  background: rgba(120, 88, 28, 0.9);
  border-color: rgba(255, 223, 122, 0.48);
}

.command-button.subtle {
  background: rgba(33, 42, 61, 0.9);
}

.dialogue-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(3, 8, 18, 0.62);
  pointer-events: auto;
}

.dialogue-panel,
.result-panel {
  width: min(720px, 100%);
  border: 1px solid rgba(117, 231, 255, 0.26);
  border-radius: 8px;
  background: rgba(8, 18, 36, 0.94);
  padding: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
}

.eyebrow {
  color: #8eeaff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.dialogue-lines {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
}

.dialogue-lines p {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  margin: 0;
  line-height: 1.7;
}

.dialogue-lines strong {
  color: #ffe6a3;
}

.result-panel h1 {
  margin: 0 0 16px;
}

.result-panel dl {
  display: grid;
  gap: 10px;
  margin: 0 0 18px;
}

.result-panel dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 8px;
}

.result-panel dt {
  color: #c8d8e8;
}

.result-panel dd {
  margin: 0;
  font-weight: 800;
}

.next-field {
  color: #ffe6a3;
}

@media (max-width: 720px) {
  .hud {
    grid-template-columns: 1fr;
  }

  .command-bar {
    width: calc(100% - 24px);
    flex-wrap: wrap;
    justify-content: center;
  }

  .dialogue-lines p {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 9: Commit DOM UI**

Run:

```bash
git add src/ui src/main.ts src/style.css
git commit -m "feat: add field 00a dom ui"
```

## Task 7: Add Field Effects

**Files:**

- Create: `src/phaser/view/effects.ts`
- Modify: `src/phaser/scenes/FieldScene.ts`

- [ ] **Step 1: Create effects helpers**

Create `src/phaser/view/effects.ts`:

```ts
import Phaser from "phaser";
import type { FieldNode } from "../../game/simulation/types";

export function playConnectPulse(scene: Phaser.Scene, x: number, y: number): void {
  const pulse = scene.add.circle(x, y, 12, 0xffdf7a, 0.44);
  scene.tweens.add({
    targets: pulse,
    scale: 3,
    alpha: 0,
    duration: 420,
    ease: "Sine.easeOut",
    onComplete: () => pulse.destroy(),
  });
}

export function playRescuePulse(scene: Phaser.Scene, node: FieldNode): void {
  const light = scene.add.circle(node.x, node.y, 10, 0xfff2b8, 0.9);
  light.setDepth(40);
  scene.tweens.add({
    targets: light,
    x: 120,
    y: 470,
    scale: 0.45,
    duration: 680,
    ease: "Sine.easeInOut",
    onComplete: () => light.destroy(),
  });
}
```

- [ ] **Step 2: Trigger effects in FieldScene dispatch**

Modify `src/phaser/scenes/FieldScene.ts` so `dispatch` stores previous state and plays effects:

```ts
  private dispatch(action: GameAction): void {
    const previousState = this.state;
    this.state = reduceGame(this.state, action);
    this.playEffects(previousState, this.state, action);
    if (this.rendered) {
      updateField(this, this.rendered, this.state);
    }
    window.dispatchEvent(new CustomEvent("llp:state", { detail: this.state }));
  }
```

Add imports:

```ts
import { playConnectPulse, playRescuePulse } from "../view/effects";
```

Add method:

```ts
  private playEffects(previousState: GameState, nextState: GameState, action: GameAction): void {
    if (action.type === "CONNECT") {
      const edge = nextState.edges.find((item) => item.id === action.edgeId);
      if (!edge) return;
      const from = nextState.nodes.find((node) => node.id === edge.from);
      const to = nextState.nodes.find((node) => node.id === edge.to);
      if (from && to) {
        playConnectPulse(this, (from.x + to.x) / 2, (from.y + to.y) / 2);
      }
    }

    if (
      previousState.rescuedTinyLights.length === 0 &&
      nextState.rescuedTinyLights.includes("N03")
    ) {
      const node = nextState.nodes.find((item) => item.id === "N03");
      if (node) playRescuePulse(this, node);
    }
  }
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 4: Commit effects**

Run:

```bash
git add src/phaser/view/effects.ts src/phaser/scenes/FieldScene.ts
git commit -m "feat: add field 00a light effects"
```

## Task 8: Manual And Browser Verification

**Files:**

- No source changes expected unless verification finds defects.

- [ ] **Step 1: Run all automated checks**

Run:

```bash
npm test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 2: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 3: Verify acceptance path manually**

In the browser:

1. Confirm StoryScene appears first.
2. Click through to BriefingScene.
3. Click through to FieldScene.
4. Confirm 6 nodes and 5 edges are visible.
5. Confirm Lumi appears at N00.
6. Click `Move N01`.
7. Confirm Lumi moves to N01.
8. Confirm `Connect E01` appears.
9. Click `Connect E01`.
10. Click `End Turn`.
11. Confirm `Move N02` appears.
12. Move to N02.
13. Click `End Turn`.
14. Move to N03.
15. Confirm ClearScene appears.
16. Click to ResultScene.
17. Confirm result text shows returned lights `1`, learned actions `Move / Connect`, and no rank.
18. Confirm Repair / Safe Place / Scan / Sync / Split never appear.

- [ ] **Step 4: Verify mobile layout**

Use browser responsive mode at 390px width:

- HUD text does not overlap.
- Command buttons wrap without leaving the viewport.
- Command buttons remain at least 44px tall.
- Dialogue panel text remains readable.
- Center field remains visible enough to understand node positions.
- Node hit areas remain tappable without needing pixel-perfect input.
- Move, Connect, and rescue feedback are visible without relying on sound.

- [ ] **Step 5: Run frontend QA skill checklist**

Use `hiro-frontend-qa` after the playable slice exists. Check these viewports:

```text
1440x900
390x844
```

Expected:

- No blank canvas.
- No missing Lumi asset.
- No UI overlap.
- No command bar trapping or hiding buttons on mobile.
- Story -> Briefing -> Field -> Clear -> Result can be completed.

- [ ] **Step 6: Stop dev server**

Stop with Ctrl+C in the terminal that runs Vite.

- [ ] **Step 7: Commit verification fixes if any**

If verification required fixes, commit them:

```bash
git add src
git commit -m "fix: polish field 00a vertical slice"
```

If no fixes were needed, do not create an empty commit.

## Acceptance Criteria

Field 00-A is accepted when:

1. StoryScene starts first.
2. BriefingScene appears after StoryScene.
3. FieldScene appears after BriefingScene.
4. Six nodes and five edges are visible.
5. Lumi is visible at N00.
6. Lumi can be selected through UI state and controlled by commands.
7. Lumi can Move from N00 to N01.
8. E01 can be connected from dotted to weak.
9. Lumi can Move N01 -> N02 -> N03 after E01 is connected.
10. N03 arrival automatically rescues the Tiny Light.
11. ClearScene appears after rescue.
12. ResultScene appears after ClearScene.
13. ResultScene shows returned lights, learned actions, Lumi & Pico, and Field 00-B teaser.
14. Repair, Safe Place, Scan, Sync, and Split are not visible.
15. `npm test` passes.
16. `npm run build` passes.

## Self-Review Notes

- Spec coverage: The plan covers Field 00-A data, scene flow, DOM overlays, edge-state movement, Connect rules, auto-rescue, ClearScene, ResultScene, and exclusion of later commands.
- Completion scan: No unresolved implementation gaps are intentionally left in the plan.
- Type consistency: `GameState`, `FieldNode`, `FieldEdge`, `CharacterUnit`, `GameAction`, `createInitialState`, `reduceGame`, `getMoveTargets`, and `getConnectTargets` are defined before use.
