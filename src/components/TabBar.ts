// src/components/TabBar.ts

import { Box, Text, createTextAttributes } from '@opentui/core';
import type { TabType } from '../types.ts';
import { theme } from '../theme';
import { centerText } from '../utils/layout';

interface TabBarProps {
  currentTab: TabType;
  width: number;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; shortcut: string }[] = [
  { id: 'installed', label: 'Installed', shortcut: '1' },
  { id: 'search', label: 'Search', shortcut: '2' },
  { id: 'updates', label: 'Updates', shortcut: '3' },
];

export function TabBar(props: TabBarProps) {
  const { currentTab, width } = props;
  
  const tabWidth = Math.floor(width / TABS.length);
  
  return Box(
    {
      width,
      height: 1,
      backgroundColor: theme.surfaceAlt,
      flexDirection: 'row',
    },
    ...TABS.map((tab) => {
      const isActive = tab.id === currentTab;
      
      return Box(
        {
          width: tabWidth,
          height: 1,
          backgroundColor: isActive ? theme.selectionBackground : theme.surfaceAlt,
        },
        Text({
          content: centerText(isActive ? `[${tab.label}]` : tab.label, tabWidth),
          width: tabWidth,
          fg: isActive ? theme.selectionForeground : theme.textMuted,
          attributes: isActive ? createTextAttributes({ bold: true }) : undefined,
        }),
      );
    }),
  );
}
