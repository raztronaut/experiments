import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Test from './Test';

test('Test renders correctly', () => {
render(
<Test />);
expect(screen.getByText('Test')).toBeDefined();
});