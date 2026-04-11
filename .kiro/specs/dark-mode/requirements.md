# Requirements Document

## Introduction

This document defines the requirements for the Dark Mode feature in the Weddly app. The feature adds a user-selectable light/dark color scheme across all four app sections (client, freelancer, admin, and venue). It is implemented using Tailwind CSS's `darkMode: 'class'` strategy, a React context for theme state, `localStorage` for persistence, and an inline script for FOUC (flash-of-unstyled-content) prevention on page load.

## Glossary

- **ThemeProvider**: The React context provider component that wraps the entire app, manages theme state, and exposes it to all descendants.
- **ThemeContext**: The React context value exposing `theme`, `resolvedTheme`, `setTheme`, and `toggleTheme`.
- **ThemeScript**: A tiny inline `<script>` rendered in `<head>` that synchronously applies the `dark` class before React hydration to prevent FOUC.
- **DarkModeToggle**: The toggle button component placed in the navbar that allows users to switch between light and dark themes.
- **ThemeMode**: The stored user preference — one of `'light'`, `'dark'`, or `'system'`.
- **ResolvedTheme**: The concrete theme actually applied — always either `'light'` or `'dark'`, never `'system'`.
- **FOUC**: Flash of Unstyled Content — a visible flicker when the page briefly renders in the wrong theme before JavaScript runs.
- **System Preference**: The OS/browser-level `prefers-color-scheme` media query value.
- **Storage**: The browser's `localStorage`, keyed at `'weddly-theme'`.

---

## Requirements

### Requirement 1: Theme Persistence

**User Story:** As a user, I want my theme preference to be saved, so that I don't have to re-select it every time I visit the app.

#### Acceptance Criteria

1. WHEN a user sets a theme via `setTheme(p)` where `p ∈ {'light', 'dark', 'system'}`, THE ThemeProvider SHALL write the value `p` to `localStorage` under the key `'weddly-theme'`.
2. WHEN the app loads and `localStorage['weddly-theme']` contains a valid ThemeMode value, THE ThemeProvider SHALL restore that preference as the active theme.
3. IF `localStorage['weddly-theme']` contains a value that is not in `{'light', 'dark', 'system'}`, THEN THE ThemeProvider SHALL treat the preference as `'system'` and overwrite the invalid value on the next explicit theme change.
4. IF `localStorage` is unavailable (e.g., SSR context or private browsing), THEN THE ThemeProvider SHALL fall back to `'system'` mode for the session without throwing an error.

---

### Requirement 2: Theme Resolution

**User Story:** As a user, I want the app to always display in a concrete light or dark appearance, so that the interface is never in an ambiguous visual state.

#### Acceptance Criteria

1. THE ThemeProvider SHALL ensure that `resolvedTheme` is always one of `{'light', 'dark'}` and never `'system'`.
2. WHILE `theme === 'system'`, THE ThemeProvider SHALL resolve the theme by reading the OS `prefers-color-scheme` media query.
3. IF `window.matchMedia` is unavailable, THEN THE ThemeProvider SHALL default `resolvedTheme` to `'light'`.
4. WHEN the OS `prefers-color-scheme` changes, THE ThemeProvider SHALL update `resolvedTheme` only if the current `theme` is `'system'`.
5. WHILE `theme` is `'light'` or `'dark'`, THE ThemeProvider SHALL NOT change `resolvedTheme` in response to OS preference changes.

---

### Requirement 3: DOM Class Application

**User Story:** As a developer, I want the `dark` CSS class to accurately reflect the resolved theme on the `<html>` element, so that Tailwind's `dark:` variants apply correctly across all components.

#### Acceptance Criteria

1. WHEN `resolvedTheme` is `'dark'`, THE ThemeProvider SHALL add the class `'dark'` to `document.documentElement`.
2. WHEN `resolvedTheme` is `'light'`, THE ThemeProvider SHALL remove the class `'dark'` from `document.documentElement`.
3. THE ThemeProvider SHALL NOT add or remove any CSS classes other than `'dark'` when applying the theme.
4. WHEN `setTheme` is called with any valid ThemeMode, THE ThemeProvider SHALL update `document.documentElement.classList` to reflect the new resolved theme before the next render.

---

### Requirement 4: FOUC Prevention

**User Story:** As a user, I want the correct theme to appear immediately on page load, so that I don't see a flash of the wrong color scheme.

#### Acceptance Criteria

1. THE ThemeScript SHALL render as a `<script>` tag inside `<head>` that executes synchronously during HTML parsing, before any CSS or JavaScript bundles load.
2. WHEN the page loads, THE ThemeScript SHALL read `localStorage['weddly-theme']` and apply the `'dark'` class to `<html>` synchronously if the resolved preference is dark.
3. THE ThemeScript SHALL be a Server Component with no `"use client"` directive so it renders in `<head>` without hydration.
4. WHEN React hydrates, THE ThemeProvider SHALL confirm the class state set by ThemeScript without causing a hydration mismatch.

---

### Requirement 5: Theme Toggle

**User Story:** As a user, I want to toggle between light and dark mode with a single click, so that I can quickly switch themes without navigating to settings.

#### Acceptance Criteria

1. WHEN a user clicks the DarkModeToggle, THE DarkModeToggle SHALL call `toggleTheme()` on the ThemeContext.
2. WHEN `toggleTheme()` is called and `resolvedTheme` is `'dark'`, THE ThemeProvider SHALL set the theme to `'light'`.
3. WHEN `toggleTheme()` is called and `resolvedTheme` is `'light'`, THE ThemeProvider SHALL set the theme to `'dark'`.
4. WHEN `toggleTheme()` is called, THE ThemeProvider SHALL exit `'system'` mode and set an explicit `'light'` or `'dark'` preference.
5. WHEN `resolvedTheme` is `'dark'`, THE DarkModeToggle SHALL render a sun icon indicating the action will switch to light mode.
6. WHEN `resolvedTheme` is `'light'`, THE DarkModeToggle SHALL render a moon icon indicating the action will switch to dark mode.
7. THE DarkModeToggle SHALL replace the existing question mark (`?`) icon in the navbar — no new icon slot is added to the navbar.

---

### Requirement 6: Accessibility

**User Story:** As a user relying on assistive technology, I want the theme toggle to be fully accessible, so that I can operate it with a keyboard or screen reader.

#### Acceptance Criteria

1. THE DarkModeToggle SHALL include an `aria-label` attribute that describes the action it will perform (e.g., `'Switch to light mode'` or `'Switch to dark mode'`).
2. THE DarkModeToggle SHALL include an `aria-pressed` attribute set to `true` when dark mode is active and `false` when light mode is active.
3. THE DarkModeToggle SHALL be operable via keyboard (focusable and activatable with Enter/Space).

---

### Requirement 7: ThemeContext API

**User Story:** As a developer, I want a stable context API for reading and setting the theme, so that any component in the app can integrate with the theme system.

#### Acceptance Criteria

1. THE ThemeProvider SHALL expose a `ThemeContext` providing `{ theme, resolvedTheme, setTheme, toggleTheme }` to all descendant components.
2. WHEN `useTheme()` is called inside a component wrapped by ThemeProvider, THE ThemeProvider SHALL return the current `ThemeContextValue`.
3. IF `useTheme()` is called outside a ThemeProvider, THEN THE ThemeProvider SHALL throw a descriptive error.
4. THE ThemeProvider SHALL accept a `defaultTheme` prop of type ThemeMode, defaulting to `'system'` if not provided.
5. THE ThemeProvider SHALL accept a `storageKey` prop, defaulting to `'weddly-theme'` if not provided.

---

### Requirement 8: Color Token Mapping

**User Story:** As a user, I want the dark mode color scheme to be visually consistent with the Weddly brand, so that the app looks polished and intentional in both themes.

#### Acceptance Criteria

1. THE ThemeProvider SHALL apply dark mode surface and text tokens that map each light-mode token to its defined dark-mode counterpart as specified in the design's ColorTokenMap.
2. WHEN dark mode is active, THE app SHALL display background color `#0f1410` in place of the light-mode `#fcf9f6`.
3. WHEN dark mode is active, THE app SHALL display on-surface text color `#e3e3e0` in place of the light-mode `#1b1c1a`.
4. THE app SHALL preserve primary and secondary brand colors (greens and golds) unchanged in both light and dark modes.

---

### Requirement 9: Cross-Section Availability

**User Story:** As a user of any part of the Weddly app, I want dark mode to be available in all sections, so that I have a consistent experience regardless of which part of the app I am using.

#### Acceptance Criteria

1. THE ThemeProvider SHALL be mounted at the root layout (`app/layout.tsx`) so that all four app sections — client, freelancer, admin, and venue — share the same theme state.
2. WHEN a user toggles the theme in any section, THE ThemeProvider SHALL apply the change across all sections without requiring a page reload.
3. THE DarkModeToggle SHALL be visible and functional in the navbar of all four app sections.

---

### Requirement 10: Error Resilience

**User Story:** As a user, I want the app to handle theme-related errors gracefully, so that a storage or environment issue never breaks the app's functionality.

#### Acceptance Criteria

1. IF `localStorage` throws an error during read or write, THEN THE ThemeProvider SHALL catch the error and continue operating with an in-memory theme state for the session.
2. IF `localStorage['weddly-theme']` contains an invalid value, THEN THE ThemeProvider SHALL fall back to `'system'` mode without throwing an error.
3. IF `window.matchMedia` is undefined, THEN THE ThemeProvider SHALL default to `'light'` theme without throwing an error.
4. WHEN a theme error is handled, THE ThemeProvider SHALL NOT expose the error to the user or disrupt the app's rendering.
