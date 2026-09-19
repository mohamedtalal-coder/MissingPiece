/// <reference types="@testing-library/jest-dom" />
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  ThemeProvider,
  useTheme,
  resolveTheme,
  applyTheme,
  isTheme,
} from '../../../shared/context/ThemeContext';

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle theme
      </button>
    </div>
  );
}

function mockMatchMedia(matchesDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesDark && query.includes('prefers-color-scheme: dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('theme helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  it('isTheme accepts only dark/light', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it('resolveTheme uses localStorage when valid', () => {
    localStorage.setItem('theme', 'light');
    mockMatchMedia(true);
    expect(resolveTheme()).toBe('light');
  });

  it('resolveTheme ignores invalid localStorage and falls back to OS', () => {
    localStorage.setItem('theme', 'purple');
    mockMatchMedia(true);
    expect(resolveTheme()).toBe('dark');
  });

  it('resolveTheme respects prefers-color-scheme when no preference saved', () => {
    mockMatchMedia(false);
    expect(resolveTheme()).toBe('light');
    mockMatchMedia(true);
    expect(resolveTheme()).toBe('dark');
  });

  it('applyTheme sets html classes and color-scheme', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('dark');

    applyTheme('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
    mockMatchMedia(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('applies resolved theme to the document on mount', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('uses OS preference on first visit and does not persist until toggled', () => {
    mockMatchMedia(true);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme, updates the DOM, and persists preference', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');

    await user.click(screen.getByRole('button', { name: /toggle theme/i }));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('re-applies persisted theme when provider mounts again (reload)', () => {
    localStorage.setItem('theme', 'dark');

    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    unmount();

    act(() => {
      document.documentElement.className = '';
      document.documentElement.style.colorScheme = '';
    });

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
