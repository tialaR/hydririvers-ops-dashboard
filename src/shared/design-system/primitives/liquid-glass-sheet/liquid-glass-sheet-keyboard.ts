export function handleSheetEscapeKey(
  event: Pick<KeyboardEvent, 'key' | 'preventDefault'>,
  onClose: () => void,
): void {
  if (event.key !== 'Escape') {
    return;
  }

  event.preventDefault();
  onClose();
}
