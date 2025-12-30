import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransitAirportSplitFlapDisplay from './TransitAirportSplitFlapDisplay';

test('renders transit board', () => {
    render(
        <TransitAirportSplitFlapDisplay />);
    expect(screen.getByRole('heading', { name: /Caltrain/i })).toBeDefined();
});