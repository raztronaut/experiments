import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import KeyboardKeys from './KeyboardKeys';

test('Keyboard-Keys renders correctly', () => {
render(
<KeyboardKeys />);
expect(screen.getByText('Keyboard-Keys')).toBeDefined();
});