import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StyledDropdownOption {
  value: string;
  label: string;
}

interface StyledDropdownProps {
  options: StyledDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  buttonClassName?: string;
}

const StyledDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  searchable = false,
  className,
  buttonClassName,
}: StyledDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalized));
  }, [options, query]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : filteredOptions.length > 0 ? 0 : -1);
  }, [open, filteredOptions, value]);

  useEffect(() => {
    if (!open || !searchable) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, searchable]);

  const closeDropdown = () => {
    setOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    closeDropdown();
  };

  const handleListNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (filteredOptions.length === 0) return -1;
        if (prev < 0) return 0;
        return (prev + 1) % filteredOptions.length;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (filteredOptions.length === 0) return -1;
        if (prev < 0) return filteredOptions.length - 1;
        return (prev - 1 + filteredOptions.length) % filteredOptions.length;
      });
    }

    if (event.key === 'Enter') {
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        event.preventDefault();
        selectOption(filteredOptions[highlightedIndex].value);
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdown();
    }
  };

  const handleButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      closeDropdown();
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={cn(
          'input-modern font-bold flex items-center justify-between gap-2 hover:bg-indigo-50/40',
          open && 'ring-2 ring-indigo-500 border-indigo-300 bg-white',
          buttonClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="styled-dropdown-listbox"
        aria-activedescendant={open && highlightedIndex >= 0 ? `styled-dropdown-option-${highlightedIndex}` : undefined}
      >
        <span className="truncate text-left">{selected?.label || placeholder}</span>
        <ChevronDown size={16} className={cn('text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute z-40 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 overflow-hidden"
          onKeyDown={handleListNavigation}
        >
          {searchable && (
            <div className="p-3 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="input-modern pl-9"
                />
              </div>
            </div>
          )}

          <div id="styled-dropdown-listbox" role="listbox" className="max-h-64 overflow-y-auto p-2 space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-slate-500">No hay resultados.</div>
            ) : (
              filteredOptions.map((option, index) => {
                const active = option.value === value;
                const highlighted = index === highlightedIndex;
                return (
                  <button
                    id={`styled-dropdown-option-${index}`}
                    key={option.value}
                    type="button"
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                        : highlighted
                          ? 'bg-indigo-50 border-indigo-100 text-slate-700'
                          : 'bg-white border-transparent text-slate-700 hover:bg-indigo-50 hover:border-indigo-100'
                    )}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="truncate text-left">{option.label}</span>
                    {active && <Check size={14} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledDropdown;
