import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import VelocityResponsiveDesign from './VelocityResponsiveDesign';

test('Velocity-Responsive Design renders correctly', () => {
    render(<VelocityResponsiveDesign />);
    expect(screen.getByRole('heading', { name: /The\s*Relativistic\s*Reader/i })).toBeDefined();
});