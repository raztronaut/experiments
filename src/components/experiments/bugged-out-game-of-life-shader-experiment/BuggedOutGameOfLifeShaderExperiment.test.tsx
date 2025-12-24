import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import BuggedOutGameOfLifeShaderExperiment from './BuggedOutGameOfLifeShaderExperiment';

test('Bugged Out Game of Life Shader renders correctly', () => {
    render(<BuggedOutGameOfLifeShaderExperiment />);
});