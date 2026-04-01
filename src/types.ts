// src/types.ts

export interface Package {
  name: string;
  version: string;
  description: string;
  repository: string;
  installed: boolean;
  size?: string;
  license?: string;
  url?: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  conflicts?: string[];
  provides?: string[];
  isAur: boolean;
  outOfDate?: boolean;
  votes?: number;
  popularity?: number;
  maintainer?: string;
  lastUpdated?: string;
}

export interface PackageSearchResult {
  packages: Package[];
  totalCount: number;
}

export interface SystemUpdate {
  packages: Package[];
  totalDownloadSize: string;
  totalInstallSize: string;
}

export type TabType = 'installed' | 'search' | 'updates';

export interface AppState {
  currentTab: TabType;
  packages: Package[];
  selectedPackage: Package | null;
  searchQuery: string;
  isLoading: boolean;
  statusMessage: string;
  errorMessage: string | null;
}

export interface ParuCommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}
