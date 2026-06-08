import { memo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface SortIconProps {
  field: string;
  currentField: string;
  direction: 'asc' | 'desc';
}

function SortIconBase({ field, currentField, direction }: SortIconProps) {
  if (field !== currentField) return null;
  return direction === 'asc'
    ? <ChevronUp className="w-4 h-4 inline ml-1" />
    : <ChevronDown className="w-4 h-4 inline ml-1" />;
}

export const SortIcon = memo(SortIconBase);
export default SortIcon;
