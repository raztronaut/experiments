import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import GravityPhysicsUiLayout from './GravityPhysicsUiLayout';

test('Gravity/Physics UI Layout renders correctly', () => {
    render(
        <GravityPhysicsUiLayout />);
    expect(screen.getAllByText('Finder').length).toBeGreaterThan(0);
});

test('Gravity/Physics UI blocking behavior', () => {
    // 1. Mount on Mobile -> Should Block
    window.innerWidth = 375;
    window.innerHeight = 667;
    const { unmount } = render(<GravityPhysicsUiLayout />);

    expect(screen.getByText('Desktop Experience Required')).toBeDefined();
    expect(screen.queryByText('Finder')).toBeNull();
    unmount();

    // 2. Mount on Desktop -> Should NOT Block
    window.innerWidth = 1024;
    window.innerHeight = 768;
    const { unmount: unmount2 } = render(<GravityPhysicsUiLayout />);

    expect(screen.queryByText('Desktop Experience Required')).toBeNull();
    // Desktop elements present
    expect(screen.getAllByText('Finder').length).toBeGreaterThan(0);

    // 3. Resize to Mobile -> Should STILL NOT Block (User requirement)
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    expect(screen.queryByText('Desktop Experience Required')).toBeNull();
    // Desktop elements should persist
    expect(screen.getAllByText('Finder').length).toBeGreaterThan(0);

    unmount2();
});