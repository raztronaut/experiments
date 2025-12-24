import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameOfLifeShader from './GameOfLifeShader';

test('Game of Life Shader renders correctly', () => {
render(
<GameOfLifeShader />);
expect(screen.getByText('Game of Life Shader')).toBeDefined();
});