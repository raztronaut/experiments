import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import MountainTransition from './MountainTransition';

test('Mountain-Transition renders correctly', () => {
render(
<MountainTransition />);
expect(screen.getByText('Mountain-Transition')).toBeDefined();
});