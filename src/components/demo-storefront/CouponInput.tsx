import { useState, type KeyboardEvent } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CouponInputProps {
  couponCodes: string[];
  onApply: (code: string) => void | Promise<void>;
  onRemove: (code: string) => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export function CouponInput({
  couponCodes,
  onApply,
  onRemove,
  disabled,
  isLoading,
}: CouponInputProps) {
  const [code, setCode] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    await onApply(trimmed);
    setCode('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            className="pl-9"
            disabled={disabled || isLoading}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleApply}
          disabled={disabled || isLoading || !code.trim()}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>

      {couponCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {couponCodes.map(c => (
            <Badge key={c} variant="secondary" className="gap-1 py-1 pr-1 pl-2.5 font-mono text-xs">
              {c}
              <button
                type="button"
                onClick={() => onRemove(c)}
                disabled={disabled || isLoading}
                className="ml-1 rounded-full p-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove coupon ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
