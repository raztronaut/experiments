import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import BasketballReplayCenter from './BasketballReplayCenter';

test('Basketball Replay Center renders correctly', () => {
render(
<BasketballReplayCenter />);
expect(screen.getByText('Basketball Replay Center')).toBeDefined();
});