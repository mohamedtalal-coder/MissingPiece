import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactElement } from 'react';
import { SearchInput } from '../../../../shared/components/ui/SearchInput';
import { LanguageProvider } from '../../../../shared/context/LanguageContext';

function renderSearchInput(ui: ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces onChange so rapid typing does not spam the parent', () => {
    const onChange = vi.fn();
    renderSearchInput(<SearchInput value="" onChange={onChange} debounceMs={300} placeholder="Search puzzles..." />);

    const input = screen.getByPlaceholderText('Search puzzles...');
    fireEvent.change(input, { target: { value: 'oak' } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onChange).toHaveBeenCalledWith('oak');
  });

  it('clears immediately when the clear button is pressed', () => {
    const onChange = vi.fn();
    renderSearchInput(<SearchInput value="heirloom" onChange={onChange} debounceMs={300} />);

    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
