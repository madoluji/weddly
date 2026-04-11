# Implementation Plan: Dark Mode

## Overview

Implement a user-selectable light/dark color scheme across all Weddly app sections using Tailwind CSS `darkMode: 'class'`, a custom React `ThemeProvider`, `localStorage` persistence, and a FOUC-prevention inline script. The existing question mark (`?`) icon in the navbar is replaced with the `DarkModeToggle` component.

## Tasks

- [x] 1. Configure Tailwind for dark mode class strategy
  - Add `darkMode: 'class'` to `tailwind.config.ts`
  - Add dark-mode color token overrides to the `colors` section in `tailwind.config.ts` (map each light surface/text token to its dark counterpart per the design's `ColorTokenMap`)
  - _Requirements: 3.1, 3.2, 3.3, 8.1, 8.2, 8.3, 8.4_

- [x] 2. Create ThemeProvider and ThemeContext
  - [x] 2.1 Implement `ThemeProvider` and `useTheme` hook in `app/context/ThemeProvider.tsx`
    - Define `ThemeMode` type and `ThemeContextValue` interface
    - Implement `initializeTheme()` logic: read `localStorage['weddly-theme']`, validate, fall back to `'system'`
    - Implement `setTheme(newMode)`: persist to `localStorage`, resolve concrete theme, update `document.documentElement.classList`, update React state
    - Implement `toggleTheme()`: flip `resolvedTheme` between `'light'` and `'dark'`, exit `'system'` mode
    - Listen to `prefers-color-scheme` media query changes and update `resolvedTheme` only when `theme === 'system'`
    - Wrap all `localStorage` and `matchMedia` access in try/catch; fall back to `'system'`/`'light'` on error
    - Throw a descriptive error when `useTheme()` is called outside a `ThemeProvider`
    - Accept `defaultTheme` (default `'system'`) and `storageKey` (default `'weddly-theme'`) props
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 2.2 Write property test for ThemeProvider — Property 1: Theme Persistence Round-Trip
    - **Property 1: For any valid ThemeMode `p ∈ {'light', 'dark', 'system'}`, after `setTheme(p)`, `localStorage['weddly-theme']` must equal `p`**
    - **Validates: Requirements 1.1**
    - Use `fast-check` to generate arbitrary valid ThemeMode values

  - [ ]* 2.3 Write property test for ThemeProvider — Property 3: resolvedTheme Is Always Concrete
    - **Property 3: For any ThemeMode input (including `'system'`), `resolvedTheme` must always be one of `{'light', 'dark'}` and never `'system'`**
    - **Validates: Requirements 2.1**
    - Use `fast-check` to generate arbitrary ThemeMode values and assert `resolvedTheme` is never `'system'`

  - [ ]* 2.4 Write property test for ThemeProvider — Property 4: toggleTheme Is an Involution
    - **Property 4: For any starting `resolvedTheme`, calling `toggleTheme()` twice must return `resolvedTheme` to its original value**
    - **Validates: Requirements 5.2, 5.3**
    - Use `fast-check` to generate arbitrary starting themes and verify double-toggle round-trip

  - [ ]* 2.5 Write property test for ThemeProvider — Property 6: System Preference Isolation
    - **Property 6: For any OS `prefers-color-scheme` change event, `resolvedTheme` updates if and only if `theme === 'system'`; explicit `'light'` or `'dark'` preferences must not be overridden**
    - **Validates: Requirements 2.4, 2.5**
    - Use `fast-check` to generate arbitrary explicit theme values and simulate media query change events

  - [ ]* 2.6 Write property test for ThemeProvider — Property 7: Invalid Storage Value Falls Back Safely
    - **Property 7: For any string not in `{'light', 'dark', 'system'}` stored in `localStorage['weddly-theme']`, the ThemeProvider must fall back to `'system'` without throwing**
    - **Validates: Requirements 1.3, 10.2**
    - Use `fast-check` to generate arbitrary invalid strings and assert no error is thrown and fallback is `'system'`

- [x] 3. Create ThemeScript for FOUC prevention
  - Implement `ThemeScript` as a Server Component in `app/ui/ThemeScript.tsx` (no `"use client"` directive)
  - Render a `<script dangerouslySetInnerHTML>` with a self-contained inline script that reads `localStorage['weddly-theme']`, resolves the theme (including `prefers-color-scheme` fallback), and synchronously adds/removes the `'dark'` class on `<html>` before React hydration
  - The inline script string must be a static hardcoded value — no user input interpolated
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Wire ThemeProvider and ThemeScript into the root layout
  - In `app/layout.tsx`, add `suppressHydrationWarning` to the `<html>` element
  - Import and render `<ThemeScript />` inside `<head>`
  - Wrap the `<body>` children with `<ThemeProvider defaultTheme="system" storageKey="weddly-theme">`
  - _Requirements: 4.3, 4.4, 9.1, 9.2_

- [x] 5. Checkpoint — Ensure ThemeProvider and FOUC prevention work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create DarkModeToggle component and replace the question mark icon
  - [x] 6.1 Implement `DarkModeToggle` in `app/ui/navbar/DarkModeToggle.tsx`
    - Consume `useTheme()` and call `toggleTheme()` on click
    - Render `SunIcon` when `resolvedTheme === 'dark'`, `MoonIcon` when `resolvedTheme === 'light'` (both from `@heroicons/react/24/outline`)
    - Add `aria-label` describing the action (`'Switch to light mode'` / `'Switch to dark mode'`)
    - Add `aria-pressed={resolvedTheme === 'dark'}`
    - Ensure the button is keyboard-focusable and activatable
    - Accept optional `className` prop
    - _Requirements: 5.1, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3_

  - [x] 6.2 Replace the `QuestionMarkCircleIcon` button in `app/ui/navbar/linksRight.tsx` with `<DarkModeToggle />`
    - Remove the `QuestionMarkCircleIcon` import and its wrapping `<button>` element
    - Import and render `<DarkModeToggle />` in the same `<li>` slot
    - Remove the `onMouseEnter`/`onMouseLeave` hover handlers from that `<li>` (no longer needed for the toggle)
    - _Requirements: 5.7, 9.3_

  - [ ]* 6.3 Write unit tests for DarkModeToggle
    - Test that clicking the toggle calls `toggleTheme()`
    - Test that `SunIcon` renders when `resolvedTheme === 'dark'` and `MoonIcon` when `resolvedTheme === 'light'`
    - Test `aria-label` and `aria-pressed` values for both states
    - _Requirements: 5.1, 5.5, 5.6, 6.1, 6.2_

- [x] 7. Apply dark mode tokens to key shared UI components
  - [x] 7.1 Add `dark:` Tailwind variants to `app/ui/globals.css` or shared layout wrappers for base surface and text colors
    - Set `dark:bg-[#0f1410]` on `<body>` or root container
    - Set `dark:text-[#e3e3e0]` as the default text color in dark mode
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.2 Add `dark:` variants to the navbar component(s) so the navbar background and text adapt to dark mode
    - _Requirements: 8.1, 9.3_

  - [ ]* 7.3 Write property test for DOM class application — Property 5: DOM Class Matches resolvedTheme
    - **Property 5: For any call to `applyDarkClass(resolved)`, `document.documentElement.classList.contains('dark')` must equal `(resolved === 'dark')`, and no other classes must be added or removed**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Use `fast-check` to generate arbitrary `'light' | 'dark'` values and assert DOM class state

- [x] 8. Verify dark mode toggle is available in all four app sections
  - Confirm the shared navbar (`linksRight.tsx`) is used (or equivalently wired) in the client, freelancer, admin, and venue layouts
  - If any section uses a separate navbar, add `<DarkModeToggle />` to that navbar's right section as well
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The design uses pseudocode for algorithms; all implementation is in TypeScript/TSX
- `ThemeScript` must remain a Server Component — do not add `"use client"` to it
- The `QuestionMarkCircleIcon` slot in `linksRight.tsx` is the exact replacement point for `DarkModeToggle`
- Property tests use `fast-check`; unit tests use the existing test framework in the project
- Each task references specific requirements for traceability
