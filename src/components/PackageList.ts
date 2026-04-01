import { Box, Text } from '@opentui/core';
import type { Package } from '../types';
import { truncate } from '../utils/helpers';
import { theme } from '../theme';
import { getListWindowStart } from '../utils/list-window';
import { getPackageListColumnLayout } from '../utils/package-list-layout';
import { formatAurRate } from '../utils/search-ranking';

interface PackageListProps {
  packages: Package[];
  selectedIndex: number;
  width: number;
  height: number;
  onSelect: (index: number) => void;
  showAurRate?: boolean;
}

export function PackageList(props: PackageListProps) {
  const { packages, selectedIndex, width, height, onSelect, showAurRate = false } = props;
  
  if (packages.length === 0) {
    return Box(
      {
        width,
        height,
        backgroundColor: theme.surface,
      },
      Text({
        content: 'No packages found',
        fg: theme.textDim,
      }),
    );
  }
  
  const itemHeight = 1;
  const visibleItems = Math.max(1, Math.floor(height / itemHeight));
  const startIndex = getListWindowStart(packages.length, visibleItems, selectedIndex);
  const visiblePackages = packages.slice(startIndex, startIndex + visibleItems);
  const hasDescription = packages.some((pkg) => pkg.description.trim().length > 0);
  const columns = getPackageListColumnLayout(width, hasDescription, showAurRate);

  return Box(
    {
      width,
      height,
      flexDirection: 'column',
      backgroundColor: theme.surface,
    },
    ...visiblePackages.map((pkg, offset) => {
        const index = startIndex + offset;
        const isSelected = index === selectedIndex;
        
        return Box(
          {
            width,
            height: itemHeight,
            backgroundColor: isSelected ? theme.selectionBackground : theme.surface,
            flexDirection: 'row',
            gap: 1,
            onMouseDown: () => onSelect(index),
          },
          Text({
            content: truncate(pkg.name, columns.nameWidth).padEnd(columns.nameWidth),
            width: columns.nameWidth,
            fg: isSelected ? theme.selectionForeground : theme.textPrimary,
          }),
          Text({
            content: truncate(pkg.version, columns.versionWidth).padEnd(columns.versionWidth),
            width: columns.versionWidth,
            fg: isSelected ? theme.selectionForeground : theme.textSecondary,
          }),
          Text({
            content: truncate(pkg.repository, columns.repoWidth).padEnd(columns.repoWidth),
            width: columns.repoWidth,
            fg: isSelected ? theme.selectionForeground : theme.textMuted,
          }),
          ...(columns.showRate
            ? [
                Text({
                  content: truncate(formatAurRate(pkg), columns.rateWidth).padEnd(columns.rateWidth),
                  width: columns.rateWidth,
                  fg: isSelected ? theme.selectionForeground : theme.textSecondary,
                }),
              ]
            : []),
          ...(columns.showDescription
            ? [
                Text({
                  content: truncate(pkg.description, columns.descWidth),
                  width: columns.descWidth,
                  fg: isSelected ? theme.selectionForeground : theme.textSecondary,
                }),
              ]
            : []),
        );
      }),
  );
}
