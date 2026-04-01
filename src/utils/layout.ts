export function centerText(text: string, width: number): string {
  if (width <= 0) {
    return '';
  }

  if (text.length >= width) {
    return text.slice(0, width);
  }

  const totalPadding = width - text.length;
  const leftPadding = Math.floor(totalPadding / 2);
  const rightPadding = totalPadding - leftPadding;
  return `${' '.repeat(leftPadding)}${text}${' '.repeat(rightPadding)}`;
}

export function getMainContentHeight(totalHeight: number): number {
  return Math.max(0, totalHeight - 3);
}
