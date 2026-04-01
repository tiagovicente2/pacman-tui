// src/components/StatusBar.ts

import { Box, Text } from '@opentui/core';
import type { AppState } from '../types.ts';
import { theme } from '../theme';

interface StatusBarProps {
  state: AppState;
  width: number;
}

export function StatusBar(props: StatusBarProps) {
  const { state, width } = props;
  
  const leftContent = state.isLoading 
    ? 'Loading...'
    : (state.errorMessage || state.statusMessage);
    
  const rightContent = state.selectedPackage 
    ? `${state.selectedPackage.name} ${state.selectedPackage.version}`
    : `${state.packages.length} packages`;
  
  const leftWidth = Math.floor(width * 0.7);
  const rightWidth = width - leftWidth - 1;
  
  return Box(
    {
      width,
      height: 1,
      backgroundColor: theme.surfaceAlt,
      flexDirection: 'row',
    },
    Text({
      content: leftContent.slice(0, leftWidth),
      width: leftWidth,
      fg: state.errorMessage ? theme.textPrimary : theme.textSecondary,
    }),
    Text({
      content: rightContent.slice(0, rightWidth).padStart(rightWidth),
      width: rightWidth,
      fg: theme.textMuted,
    }),
  );
}
