import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import NonEuclideanHyperbolicWorkspace from './NonEuclideanHyperbolicWorkspace';

test('renders workspace without crashing', () => {
    const { container } = render(<NonEuclideanHyperbolicWorkspace />);
    expect(container).toBeDefined();
});