export interface PackageListColumnLayout {
  nameWidth: number;
  versionWidth: number;
  repoWidth: number;
  rateWidth: number;
  descWidth: number;
  showDescription: boolean;
  showRate: boolean;
}

export function getPackageListColumnLayout(
  width: number,
  hasDescription: boolean,
  showAurRate: boolean = false,
): PackageListColumnLayout {
  const safeWidth = Math.max(30, width);
  const versionWidth = Math.min(16, Math.max(10, Math.floor(safeWidth * 0.18)));
  const repoWidth = Math.min(10, Math.max(6, Math.floor(safeWidth * 0.12)));
  const showRate = showAurRate && safeWidth >= 70;
  const rateWidth = showRate ? 8 : 0;
  const gapCount = showRate ? 3 : 2;

  if (!hasDescription || safeWidth < 70) {
    const nameWidth = Math.max(12, safeWidth - versionWidth - repoWidth - rateWidth - gapCount);
    return {
      nameWidth,
      versionWidth,
      repoWidth,
      rateWidth,
      descWidth: 0,
      showDescription: false,
      showRate,
    };
  }

  const descWidth = Math.max(16, Math.floor(safeWidth * 0.28));
  const nameWidth = Math.max(12, safeWidth - versionWidth - repoWidth - rateWidth - descWidth - (gapCount + 1));
  return {
    nameWidth,
    versionWidth,
    repoWidth,
    rateWidth,
    descWidth,
    showDescription: true,
    showRate,
  };
}
