import type { Package } from '../types';

export function shouldUpdateSelectedPackage(selectedPackage: Package | null): boolean {
  return Boolean(selectedPackage?.installed);
}
