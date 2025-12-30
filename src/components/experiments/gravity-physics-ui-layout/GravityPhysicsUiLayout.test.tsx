import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import GravityPhysicsUiLayout from './GravityPhysicsUiLayout';

test('Gravity/Physics UI Layout renders correctly', () => {
    render(
        <GravityPhysicsUiLayout />);
    expect(screen.getAllByText('Finder').length).toBeGreaterThan(0);
});

test('Gravity/Physics UI shows blocking screen on mobile', () => {
    // Mock mobile viewport
    window.innerWidth = 375;
    window.innerHeight = 667;
    window.dispatchEvent(new Event('resize'));

    render(<GravityPhysicsUiLayout />);

    expect(screen.getByText('Desktop Experience Required')).toBeDefined();
    // Should not show desktop elements
    expect(screen.queryByText('Finder')).toBeNull();

    // Reset viewport for other tests
    window.innerWidth = 1024;
    window.innerHeight = 768;
    window.dispatchEvent(new Event('resize'));
});