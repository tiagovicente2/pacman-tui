import type { Package } from '../types.ts';

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  if (maxLength <= 3) return text.slice(0, maxLength);
  return text.slice(0, maxLength - 3) + '...';
}

export function formatPackageSize(size?: string): string {
  if (!size) return 'N/A';
  return size;
}

export function sortPackages(packages: Package[], sortBy: 'name' | 'repo' = 'name'): Package[] {
  return [...packages].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'repo':
        return a.repository.localeCompare(b.repository);
      default:
        return 0;
    }
  });
}

export function filterPackages(packages: Package[], query: string): Package[] {
  const lowerQuery = query.toLowerCase();
  return packages.filter(pkg => 
    pkg.name.toLowerCase().includes(lowerQuery) ||
    pkg.description.toLowerCase().includes(lowerQuery)
  );
}

export function debounce<T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number
): { (...args: Parameters<T>): void; cleanup: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  const debouncedFn = (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
  
  debouncedFn.cleanup = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFn;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
