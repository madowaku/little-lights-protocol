# Little Lights Protocol Field 00-A Design

Date: 2026-07-04

## Summary

Build the first playable vertical slice for Little Lights Protocol as a Phaser + TypeScript + Vite browser game.

The first scope is Field 00-A, "The First Light." It should teach only the first verbs: move Lumi, connect a dotted Lightline, reach a Tiny Light, and see the Core Lantern brighten. The experience should be small, readable, and emotionally clear: connecting light brings something back.

This design deliberately starts with Field 00-A rather than Field 01. Field 01 remains the later first full tactical test, but Field 00-A is the better first implementation because it proves the basic feel without four characters, enemies, failure pressure, hidden routes, or repair systems.

## Goals

- Let the player complete one short field from story intro to result screen.
- Make Move, Connect, and Tiny Light rescue understandable without a manual.
- Establish a code structure that can grow into Field 00-B, 00-C, 00-D, and Field 01.
- Keep Phaser scenes focused on rendering and input, while simulation modules own game rules.
- Use the existing Lumi chibi asset as the first character token.
- Keep the UI bright, readable, and game-like without covering the field.

## Non-Goals

- No enemies or Noise behavior in Field 00-A.
- No game-over state in Field 00-A.
- No Safe Place, Repair, Scan, Sync, Split, inventory, growth, or save system.
- No full sprite animation pipeline yet.
- No Field 01 rules in this first vertical slice.
- No attempt to polish all final UI art before the basic game loop works.

## Player Experience

The player starts with a short story scene. Lumi wakes near the Core Lantern, hears a faint Tiny Light, and decides to go meet it.

The field shows six nodes and five edges. The player selects Lumi, moves from the Core Lantern to the first relay, uses Connect on a dotted route, moves along the newly connected Lightline, and reaches the Tiny Light. On arrival, the Tiny Light is automatically rescued and returns toward the Core Lantern.

The field then transitions to a clear scene and a result screen. The result screen should emphasize what the player learned instead of ranking performance:

- Field 00-A Clear
- Returned lights: 1
- Learned actions: Move / Connect
- New companion focus: Lumi & Pico
- Message: Connecting light lets you reach fading lights.

## Scene Flow

Field 00-A uses this flow:

```text
StoryScene
  -> BriefingScene
  -> FieldScene
  -> ClearScene
  -> ResultScene
```

For this slice, StoryScene and BriefingScene should be DOM overlays driven by the game's scene state. The Phaser scene can stay mounted underneath, but field input should be disabled while these overlays are active. This keeps text readable and leaves room for longer conversations in later fields.

FieldScene owns the live board. ClearScene and ResultScene should be separate states or overlays, not hard-coded branches inside field rendering.

## Field Content

Field 00-A contains:

```text
[N05 Memory Sign]
      |
[N04 Old Bench]
      :
[N02 Dotted Street] -- [N03 Tiny Light]
      |
[N01 Faint Relay]
      |
[N00 Core Lantern]
```

Nodes:

| ID | Name | Type | Initial State | Purpose |
| --- | --- | --- | --- | --- |
| N00 | Core Lantern | core | stable | Start point |
| N01 | Faint Relay | relay | weak | First move target |
| N02 | Dotted Street | empty | unlinked | Connect destination |
| N03 | First Tiny Light | tinyLight | weak | Rescue target |
| N04 | Old Bench | empty | dormant | Optional flavor node |
| N05 | Memory Sign | memory | dormant | Clear-scene hint |

Edges:

| ID | From | To | Initial State | Purpose |
| --- | --- | --- | --- | --- |
| E00 | N00 | N01 | stable | First movement path |
| E01 | N01 | N02 | dotted | Connect tutorial |
| E02 | N02 | N03 | weak | Tiny Light path |
| E03 | N02 | N04 | dotted | Optional side route |
| E04 | N04 | N05 | hidden | Future hint, not used in 00-A |

For Field 00-A, the victory condition is simply that Lumi reaches N03 and rescues the Tiny Light.

## Game Rules

The first implementation needs only these rules:

- A character can move across an edge with state stable, weak, or temporary.
- A character cannot move across dotted, broken, hidden, or locked edges.
- In Field 00-A, edge state controls movement. Node state is visual and informational unless the node is a Tiny Light rescue target.
- Lumi can Connect adjacent dotted or weak edges.
- Connect changes dotted to weak, and weak to stable.
- A Tiny Light is rescued automatically when Lumi reaches its node.
- On rescue, the field result becomes clear.

Field 00-A has a turn counter for future consistency, but it does not fail when the counter grows. If the player stalls, the UI can provide a hint rather than a loss.
End Turn increments the counter, resets action availability, and can update hints. It does not run enemy logic in Field 00-A.

## Architecture

The project should be scaffolded as a Vite TypeScript app with Phaser as the game runtime.

Recommended structure:

```text
src/
  data/
    fields/
      field00A.ts
  game/
    simulation/
      types.ts
      state.ts
      reducer.ts
      selectors.ts
    input/
      actions.ts
    assets/
      manifest.ts
  phaser/
    scenes/
      BootScene.ts
      FieldScene.ts
    view/
      fieldRenderer.ts
      effects.ts
  ui/
    dialogue.ts
    hud.ts
    commandBar.ts
    result.ts
  main.ts
  style.css
```

Responsibilities:

- `data/fields`: authored field data only.
- `game/simulation`: source of truth for board state and rules.
- `game/input`: action names and input-to-action helpers.
- `game/assets`: stable asset keys and file references.
- `phaser/scenes`: Phaser lifecycle, camera, pointer input, and scene orchestration.
- `phaser/view`: drawing nodes, edges, tokens, highlights, and effects.
- `ui`: DOM overlays for dialogue, HUD, commands, and result screens.

Phaser should read simulation state and dispatch actions back into the simulation. Simulation logic should not depend on Phaser objects, tweens, sprites, or scene lifetime.

## UI Direction

Use a low-chrome game UI with the field as the center of attention.

Persistent UI:

- A compact top status strip for field name, turn, and objective.
- A small character status chip for Lumi.
- A bottom command bar with only available actions.
- A contextual hint line that changes as the player progresses.

Command availability in Field 00-A:

- Move
- Connect
- End Turn

Do not show locked commands such as Repair, Safe Place, Scan, Sync, or Split in Field 00-A. They can appear in later fields when learned.

The center of the playfield should remain clear. Dialogue can briefly overlay the field before and after play, but during normal play it should not compete with nodes and Lightlines.

## Visual Direction

Field 00-A should feel like a sleeping city beginning to glow, not a dark battlefield.

Use:

- Deep navy background with soft city-grid or street-shape hints.
- Stable Lightlines as bright cyan or warm white-blue.
- Weak Lightlines as warm gold.
- Dotted Lightlines as pale dotted strokes.
- Hidden routes as almost invisible or delayed hints.
- Core Lantern as the brightest anchor.
- Tiny Light as a small warm pulse.

The existing Lumi chibi image should be used as the first character token:

```text
assets/characters/lumi/chibi/lumi_chibi_idle.png
```

If the image is too large for a node token, use a cropped or scaled runtime display first. Do not generate new sprite sheets for this slice.

## Error Handling

Invalid actions should fail softly with a clear hint:

- Trying to move across a dotted edge: "This path needs light first."
- Trying to Connect a non-adjacent edge: "Lumi needs to stand beside that Lightline."
- Trying to act after the field is clear: ignore input and keep the clear overlay active.
- Missing assets: fall back to a simple colored Lumi token so the field remains playable.

The game should not crash or enter an unwinnable state during Field 00-A.

## Testing And Verification

Minimum verification for this slice:

- `npm run build` completes.
- The browser loads the game without console errors.
- The player can advance from StoryScene to BriefingScene to FieldScene.
- Lumi can move from N00 to N01.
- Lumi can Connect E01 from dotted to weak.
- Lumi can move to N02, then N03.
- N03 rescue triggers ClearScene.
- ResultScene displays returned lights and learned actions.
- UI remains readable at desktop and narrow mobile widths.

If a dev server is used, run it locally and verify the first screen and playfield in a browser.

## Risks

- Phaser scene code can become a rule dump if simulation boundaries are not kept clean.
- DOM overlays can obscure the field if the first HUD is too large.
- The existing Lumi asset may need runtime scaling and anchoring to read well as a board token.
- If Field 00-A is overbuilt, the project may lose the fast emotional proof of "connecting feels good."
- If Field 00-A is under-structured, adding Mame, Gear, and Nono later will create rewrite pressure.

## Implementation Sequence

1. Scaffold Vite + TypeScript + Phaser.
2. Copy or reference the Lumi chibi asset through an asset manifest.
3. Add Field 00-A data.
4. Add simulation types, initial state, selectors, and reducer actions for select, move, connect, rescue, and scene advance.
5. Add BootScene and FieldScene.
6. Render nodes, edges, Lumi token, selection, move targets, and connect targets.
7. Add DOM HUD, command bar, dialogue overlay, clear overlay, and result screen.
8. Verify the complete Field 00-A loop.

## Acceptance Criteria

Field 00-A is complete when:

- A player can finish the whole slice without developer assistance.
- The only required verbs are Move and Connect.
- The Tiny Light rescue is visible and understandable.
- The clear/result flow confirms the learned actions.
- The codebase has clear boundaries between field data, simulation rules, Phaser rendering, and DOM UI.
- The first slice is ready to extend with Field 00-B's Safe Place command without rewriting Field 00-A.
