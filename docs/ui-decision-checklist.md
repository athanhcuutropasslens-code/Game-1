# UI decision checklist after extracting a pure TypeScript engine

## Current boundary from the existing app shell

### `client/src/App.tsx`
- Pure application shell.
- Keeps providers (`ErrorBoundary`, `ThemeProvider`, `TooltipProvider`, `Toaster`) and route wiring.
- No game rules, combat math, loot logic, or state transition logic should live here.

### `client/src/pages/Home.tsx`
- Pure page-level shell.
- Only centers the game surface and applies the page background/container styling.
- Safe to keep regardless of whether the final UI stays in React or is rewritten to HTML/CSS/JS.

### `client/src/components/Game.tsx`
- Currently mixes **three responsibilities** in one file:
  1. **Engine/domain logic**: state machine constants, item/class/zone/effect databases, combat/status helpers, loot generation, monster generation, stat computation, inventory/equipment logic.
  2. **Controller/orchestration**: `useState`, `useMemo`, `useCallback`, modal toggling, room progression, battle flow, log/effect sequencing.
  3. **View/UI rendering**: HUD, map screen, combat screen, inventory/stat/shop modals, buttons, responsive layout classes, icons, and interaction wiring.
- This file is therefore the main place to separate:
  - **Pure engine** = deterministic data structures, `GameState`, reducers/actions, selectors, combat/map/inventory/shop rules.
  - **UI shell** = React components or a different renderer that reads state and dispatches actions.

## What should be considered “already extracted to engine” vs “still UI shell”

### Should belong to the pure TypeScript engine
- Game state enum / screen phase model.
- Player, monster, loot, inventory, equipment, room, floor, and zone data models.
- Combat resolution.
- Status effect ticking.
- Stat calculation and derived selectors.
- Loot/shop/item generation.
- Room progression and floor/map progression.
- Action contract such as:
  - `START_GAME`
  - `SELECT_CLASS`
  - `SELECT_ZONE`
  - `ENTER_ROOM`
  - `PLAY_TURN`
  - `USE_ITEM`
  - `EQUIP_ITEM`
  - `UNEQUIP_ITEM`
  - `BUY_ITEM`
  - `BUY_SERVICE`
  - `ALLOCATE_STAT`
  - `CONFIRM_STATS`
  - `UPGRADE_SKILL`
  - `CLOSE_MODAL`

### Should remain UI shell only
- Providers, routes, page wrappers.
- Tailwind/layout classes and responsive containers.
- Lucide icons and purely visual presentation choices.
- Modal open/close animations and focus handling.
- Screen composition for map/combat/inventory/stats/shop.
- Toasts, transitions, hit flashes, floating numbers, and visual log rendering.

## UI decision checklist

Use the checklist below after the engine is moved behind a stable `GameState + Action` contract.

### 1) Chi phí giữ React
- [ ] The team still wants component composition, hooks, and declarative conditional rendering.
- [ ] Existing modal/state wiring is easier to keep than to rebuild imperatively.
- [ ] Current screen complexity justifies component boundaries more than DOM-manual updates.
- [ ] The project already depends on React providers/router/theme utilities that would otherwise be replaced.
- [ ] The team accepts the cost of refactoring `Game.tsx` into multiple presentational/container components instead of deleting React.
- [ ] The team wants easier long-term maintenance for multiple panels/screens rather than a single imperative renderer.

### 2) Chi phí rewrite thuần HTML/CSS/JS
- [ ] The team is willing to rebuild rendering, event binding, modal behavior, and responsive layout without React.
- [ ] The team is comfortable maintaining manual DOM diff/update code or a custom renderer.
- [ ] Replacing React providers, route-level composition, and component ergonomics is acceptable.
- [ ] The performance/footprint benefit is important enough to justify a full UI rewrite.
- [ ] The schedule can absorb QA for regressions in inventory, combat, modal flow, and mobile layout.
- [ ] The rewrite budget includes rebuilding visual states now encoded through JSX conditionals.

### 3) Nhu cầu animation, modal, inventory panel, responsive layout
- [ ] Heavy animation or frequent screen transitions need a component model and animation library friendliness.
- [ ] Multiple modals can be open/managed predictably with clear ownership and accessibility behavior.
- [ ] Inventory and stats panels require nested interactive widgets, pagination, selection state, and comparison UI.
- [ ] Responsive layout changes across mobile/desktop are easier to reason about in componentized markup.
- [ ] Future UI growth (tooltips, drag/drop, onboarding overlays, controller support) favors structured composition.

### 4) Khả năng tái sử dụng engine hiện có
- [ ] The extracted engine can expose a renderer-agnostic state snapshot (`GameState`).
- [ ] The extracted engine can accept renderer-agnostic actions/events.
- [ ] React UI and non-React UI can both subscribe to the same engine outputs.
- [ ] Combat, inventory, shop, and map logic can run without any JSX, hooks, or DOM APIs.
- [ ] Save/load and test coverage target engine APIs instead of component internals.
- [ ] Any remaining helpers duplicated between `Game.tsx` and utility files are removed so the engine becomes the single source of truth.

## Recommended decision rule

### Prefer **keeping React** if most answers below are “yes”
- The UI has several rich screens and modals.
- Responsive layout matters.
- Accessibility/focus management matters.
- The main pain is the monolithic `Game.tsx`, not React itself.
- The engine can be reused cleanly by moving logic downward, while React becomes a thin shell.

### Prefer **rewriting UI** if most answers below are “yes”
- The UI target is intentionally minimal and mostly canvas/DOM rendering.
- The team wants a very small runtime surface.
- The team is comfortable with imperative rendering.
- The project no longer benefits from route/provider/component infrastructure.
- The engine contract is already stable enough that only the renderer changes.

## If the decision is to keep React

Refactor `client/src/components/Game.tsx` into a thin container plus feature components:

- `Game.tsx`
  - Connects to the engine.
  - Reads `GameState` and dispatches engine actions.
  - Owns only top-level composition.
- `MapScreen.tsx`
  - Room list/map progression UI.
  - Travel controls and floor selection UI.
- `CombatScreen.tsx`
  - Combat HUD, monster/player display, combat actions, battle log panel.
- `InventoryModal.tsx`
  - Equipment slots, inventory grid/list, pagination, item comparison/actions.
- `StatsModal.tsx`
  - Stat allocation, derived stat breakdown, skill upgrades.
- `ShopModal.tsx`
  - Shop inventory, services, purchase actions.

Suggested React layering:
- **engine/**
  - pure state, reducer, selectors, rules.
- **components/game/**
  - presentational components only.
- **hooks/**
  - `useGameEngine()` adapter if React-specific subscription glue is needed.

## If the decision is to rewrite the UI

Keep the TypeScript engine unchanged and build a new renderer that:
- Reads the same `GameState` snapshot.
- Dispatches the same action contract.
- Maps engine state to HTML templates/DOM nodes.
- Preserves the same modal/screen concepts at the renderer layer only.

Suggested non-React structure:
- `engine/`
  - unchanged pure TypeScript logic.
- `renderer/`
  - `renderApp(state)`
  - `renderMapScreen(state)`
  - `renderCombatScreen(state)`
  - `renderInventoryModal(state)`
  - `renderStatsModal(state)`
  - `renderShopModal(state)`
- `events/`
  - DOM listeners translating clicks/keyboard input into the same engine actions.

## Practical recommendation for this codebase snapshot

Given the current files, the app shell in `App.tsx` and `Home.tsx` is already very thin, while `Game.tsx` contains a large amount of mixed orchestration and view code. That suggests the first high-value move is:

1. Finish extracting engine logic from `Game.tsx` into pure TypeScript modules.
2. Keep React as the first UI shell.
3. Split the current monolith into screen/modal components.
4. Re-evaluate a renderer rewrite only after the engine contract is stable and well-tested.

This path minimizes rewrite risk while preserving the option to add a second renderer later.
