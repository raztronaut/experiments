import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import NotFound404 from './404NotFound';

test('404 Not Found renders without crashing', () => {
    // We can't easily test R3F content with standard RTL without extra setup
    // but we can check if the container renders.
    const { container } = render(<NotFound404 />);
    expect(container).toBeDefined();
});