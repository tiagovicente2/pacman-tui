import { Box, Text } from '@opentui/core';
import { theme } from '../theme';
import type { SearchMode } from '../utils/keyboard';

interface SearchInputProps {
  query: string;
  width: number;
  mode: SearchMode;
  placeholder?: string;
}

export function SearchInput(props: SearchInputProps) {
  const { query, width, mode, placeholder = 'Search packages...' } = props;

  const content = query.length > 0 ? query : placeholder;
  const suffix = mode === 'input' ? '|' : '';
  const maxWidth = Math.max(1, width - 10);
  
  return Box(
    {
      width,
      height: 1,
      backgroundColor: theme.surfaceAlt,
      flexDirection: 'row',
      gap: 1,
    },
    Text({
      content: 'Search:',
      fg: theme.textPrimary,
      width: 8,
    }),
    Text({
      content: `${content}${suffix}`.slice(0, maxWidth),
      width: maxWidth,
      fg: query.length > 0 ? theme.textPrimary : theme.textDim,
    }),
  );
}
