import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import GravityPhysicsUiLayout from './GravityPhysicsUiLayout';

test('Gravity/Physics UI Layout renders correctly', () => {
    render(
        <GravityPhysicsUiLayout />);
    expect(screen.getAllByText('Finder').length).toBeGreaterThan(0);
});