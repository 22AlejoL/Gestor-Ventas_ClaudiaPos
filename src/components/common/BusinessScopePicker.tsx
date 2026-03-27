import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, Layers3, Search, Store } from 'lucide-react';
import { Business } from '../../types';
import { cn } from '../../lib/utils';

interface BusinessScopePickerProps {
  businesses: Business[];
  selectedBusiness: string;
  onSelectBusiness: (businessId: string) => void;
  allowAll?: boolean;
  allLabel?: string;
  title?: string;
  helperText?: string;
  className?: string;
}

const BusinessScopePicker = ({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  allowAll = true,
  allLabel = 'Consolidado Global',
  title = 'Alcance de empresa',
  helperText,
  className,
}: BusinessScopePickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const companyOptions = businesses
      .filter((business) => business.name.toLowerCase().includes(normalizedQuery))
      .map((business) => ({
        value: business.id,
        label: business.name,
        icon: Store,
      }));

    const base = allowAll
      ? [{ value: 'ALL', label: allLabel, icon: Layers3 }]
      : [];

    return [...base, ...companyOptions];
  }, [allowAll, allLabel, businesses, query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const selectedIndex = options.findIndex((option) => option.value === selectedBusiness);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : options.length > 0 ? 0 : -1);
  }, [open, options, selectedBusiness]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  const closePicker = () => {
    setOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const selectOption = (value: string) => {
    onSelectBusiness(value);
    closePicker();
  };

  const handleListNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (options.length === 0) return -1;
        if (prev < 0) return 0;
        return (prev + 1) % options.length;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        if (options.length === 0) return -1;
        if (prev < 0) return options.length - 1;
        return (prev - 1 + options.length) % options.length;
      });
    }

    if (event.key === 'Enter') {
      if (highlightedIndex >= 0 && options[highlightedIndex]) {
        event.preventDefault();
        selectOption(options[highlightedIndex].value);
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closePicker();
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
      closePicker();
    }
  };

  const selectedLabel = selectedBusiness === 'ALL'
    ? allLabel
    : businesses.find((business) => business.id === selectedBusiness)?.name || 'Seleccionar empresa';

  const selectedOption = options.find((option) => option.value === selectedBusiness);
  const SelectedIcon = selectedOption?.icon || Building2;

  if (!businesses.length) return null;

  return (
    <div ref={rootRef} className={cn('surface-card p-4 relative', className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">{title}</p>
          {helperText && <p className="text-xs text-slate-500 mt-1">{helperText}</p>}
        </div>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Building2 size={18} />
        </div>
      </div>

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleButtonKeyDown}
          className={cn(
            'input-modern pl-3 pr-3 font-bold flex items-center justify-between gap-3 hover:bg-indigo-50/40',
            open && 'ring-2 ring-indigo-500 border-indigo-300 bg-white'
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls="business-scope-listbox"
          aria-activedescendant={open && highlightedIndex >= 0 ? `business-scope-option-${highlightedIndex}` : undefined}
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <SelectedIcon size={14} />
            </span>
            <span className="truncate text-left">{selectedLabel}</span>
          </span>
          <ChevronDown size={16} className={cn('text-slate-400 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div
            className="absolute z-30 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden"
            onKeyDown={handleListNavigation}
          >
            <div className="p-3 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="input-modern pl-9"
                />
              </div>
            </div>

            <div id="business-scope-listbox" role="listbox" className="max-h-64 overflow-y-auto p-2 space-y-1">
              {options.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-slate-500">No se encontraron empresas.</div>
              ) : (
                options.map((option, index) => {
                  const active = selectedBusiness === option.value;
                  const highlighted = index === highlightedIndex;
                  const OptionIcon = option.icon;
                  return (
                    <button
                      id={`business-scope-option-${index}`}
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
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <OptionIcon size={14} />
                        <span className="truncate text-left">{option.label}</span>
                      </span>
                      {active && <Check size={14} />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs font-semibold text-slate-500">Seleccionada: {selectedLabel}</p>
    </div>
  );
};

export default BusinessScopePicker;
