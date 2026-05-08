import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { DemoCartItem } from '@/types/integrationApi';

interface StorefrontCartProps {
  items: DemoCartItem[];
  onUpdateItem: (sku: string, updates: Partial<DemoCartItem>) => void;
  onRemoveItem: (sku: string) => void;
  onAddItem: (item: DemoCartItem) => void;
  disabled?: boolean;
}

const AVATAR_PALETTE = [
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-orange-100 text-orange-700',
];

function avatarStyle(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface InlineEditProps {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  type?: 'text' | 'number';
  step?: string;
  min?: string;
  prefix?: string;
  alignRight?: boolean;
  disabled?: boolean;
  ariaLabel: string;
}

function InlineEdit({
  value,
  onChange,
  className,
  inputClassName,
  placeholder,
  type = 'text',
  step,
  min,
  prefix,
  alignRight,
  disabled,
  ariaLabel,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const commit = () => {
    if (draft !== value) onChange(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  if (editing && !disabled) {
    return (
      <Input
        ref={inputRef}
        type={type}
        step={step}
        min={min}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn('h-8', alignRight && 'text-right tabular-nums', inputClassName)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && setEditing(true)}
      disabled={disabled}
      aria-label={`Edit ${ariaLabel}`}
      className={cn(
        'group/edit -mx-1 inline-flex w-full cursor-text items-center rounded-sm px-1 py-0.5 text-left transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60',
        alignRight && 'justify-end text-right',
        className
      )}
    >
      {prefix && <span className="mr-0.5 text-slate-400">{prefix}</span>}
      <span className={cn(!value && 'text-slate-400 italic')}>{value || placeholder}</span>
    </button>
  );
}

export function StorefrontCart({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  disabled,
}: StorefrontCartProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftSku, setDraftSku] = useState('');
  const [draftPrice, setDraftPrice] = useState('');

  const handleAdd = () => {
    if (!draftName.trim() || !draftSku.trim() || !draftPrice) return;
    const price = parseFloat(draftPrice);
    if (Number.isNaN(price)) return;
    onAddItem({
      sku: draftSku.trim(),
      name: draftName.trim(),
      price,
      quantity: 1,
    });
    setDraftName('');
    setDraftSku('');
    setDraftPrice('');
    setIsAdding(false);
  };

  if (items.length === 0 && !isAdding) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <Plus className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">Your cart is empty.</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="mt-4"
          disabled={disabled}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add your first item
        </Button>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {items.map(item => {
          const initial = (item.name || '?').trim().charAt(0).toUpperCase();
          return (
            <li
              key={item.sku}
              className="group flex items-center gap-4 py-3 transition-colors hover:bg-slate-50/40"
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  avatarStyle(item.sku)
                )}
                aria-hidden
              >
                {initial}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800">
                  <InlineEdit
                    value={item.name}
                    onChange={next => onUpdateItem(item.sku, { name: next })}
                    placeholder="Product name"
                    disabled={disabled}
                    ariaLabel="product name"
                  />
                </div>
                <div className="font-mono text-xs text-slate-400">
                  <InlineEdit
                    value={item.sku}
                    onChange={next => onUpdateItem(item.sku, { sku: next.trim() || item.sku })}
                    placeholder="SKU"
                    disabled={disabled}
                    ariaLabel="SKU"
                  />
                </div>
              </div>

              <div className="w-24 shrink-0 text-right text-sm text-slate-600 tabular-nums">
                <InlineEdit
                  value={item.price.toFixed(2)}
                  onChange={next => {
                    const parsed = parseFloat(next);
                    if (!Number.isNaN(parsed)) onUpdateItem(item.sku, { price: parsed });
                  }}
                  type="number"
                  step="0.01"
                  min="0"
                  prefix="$"
                  alignRight
                  disabled={disabled}
                  ariaLabel="price"
                  inputClassName="h-8"
                />
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    onUpdateItem(item.sku, { quantity: Math.max(1, item.quantity - 1) })
                  }
                  disabled={disabled || item.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onUpdateItem(item.sku, { quantity: item.quantity + 1 })}
                  disabled={disabled}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="w-20 shrink-0 text-right text-sm font-semibold text-slate-900 tabular-nums">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemoveItem(item.sku)}
                disabled={disabled}
                className="shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 focus:opacity-100"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          );
        })}

        {isAdding && (
          <li className="flex items-start gap-3 py-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-400"
              aria-hidden
            >
              {(draftName || '?').charAt(0).toUpperCase() || '?'}
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_120px]">
              <div className="space-y-1.5">
                <Input
                  value={draftName}
                  onChange={e => setDraftName(e.target.value)}
                  placeholder="Product name"
                  className="h-9"
                  autoFocus
                />
                <Input
                  value={draftSku}
                  onChange={e => setDraftSku(e.target.value)}
                  placeholder="SKU"
                  className="h-8 font-mono text-xs"
                />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={draftPrice}
                onChange={e => setDraftPrice(e.target.value)}
                placeholder="Price"
                className="h-9 tabular-nums"
              />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleAdd} className="flex-1">
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraftName('');
                    setDraftSku('');
                    setDraftPrice('');
                    setIsAdding(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </li>
        )}
      </ul>

      {!isAdding && items.length > 0 && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-200 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another item
        </button>
      )}
    </div>
  );
}
