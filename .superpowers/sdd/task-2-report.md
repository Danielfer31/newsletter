# Task 2 Report: Build Route World Components

## Status

Completed.

## Scope Delivered

Implemented the presentational route-world components defined in the Task 2 brief:

- `src/app/rutas/[category]/RouteWorld.tsx`
- `src/app/rutas/[category]/RouteWorldNav.tsx`

No unrelated source files were edited.

## What Was Implemented

### `RouteWorldNav.tsx`

- Built the "Otras rutas" navigation component.
- Uses `CATEGORY_ORDER` as the source of route ordering.
- Filters out the active route.
- Uses `CATEGORY_META` for label and accent color.
- Uses `getRouteHref(category)` for canonical route links.

### `RouteWorld.tsx`

- Built the route-world page shell using `SiteHeader`.
- Uses `CATEGORY_META` as the canonical source for:
  - route label
  - route experience copy
  - accent color
  - paper color
  - map background
  - image asset
  - map expression
  - coordinates
- Added `RouteLayout` import and typed `layoutClass` as `Record<RouteLayout, string>` per brief guidance.
- Implemented:
  - hero section
  - atlas back link
  - route headline and deck
  - route artifact visual
  - featured posts list limited to first 3 posts
  - empty state
  - sidebar module with motif, map expression, and coordinates
  - route navigation sidebar

### `RouteArtifact`

- Implemented the route artifact visual module in the same file.
- Uses the category image and layout-specific SVG overlays.
- Preserves the editorial / cartographic look specified in the brief.

## Verification

Ran:

```bash
npm run lint
```

Result:

- Pass with warnings only
- No lint errors introduced by the new files

Warnings were pre-existing and outside this task's scope:

- `src/app/post/[slug]/page.tsx`
- `src/components/LiveMap.tsx`
- `src/components/PostCard.tsx`

All warnings are `@next/next/no-img-element`.

## Notes

- UI copy was kept in Spanish.
- No dependencies were added.
- No post-page redesign work was performed.
- Implementation follows the brief values directly, with only the allowed type adjustment for `RouteLayout`.

## Commit

Planned commit message:

```bash
feat: add route world components
```
