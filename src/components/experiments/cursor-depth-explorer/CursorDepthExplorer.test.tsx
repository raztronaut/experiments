import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import CursorDepthExplorer from './CursorDepthExplorer';

test('Cursor Depth Explorer renders correctly', () => {
render(
<CursorDepthExplorer />);
expect(screen.getByText('Cursor Depth Explorer')).toBeDefined();
});