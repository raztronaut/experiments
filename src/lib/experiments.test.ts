import { describe, it, expect, vi } from 'vitest';
import { getExperiments } from './experiments';
import { readdir, readFile } from 'fs/promises';

vi.mock('fs/promises', () => ({
    readdir: vi.fn(),
    readFile: vi.fn()
}));

describe('getExperiments', () => {
    it('should return experiments sorted by date descending', async () => {
        const mockEntries = [
            { isDirectory: () => true, name: '(experiment-a)' },
            { isDirectory: () => true, name: '(experiment-b)' }
        ];

        const mockConfigA = JSON.stringify({
            title: 'Experiment A',
            description: 'Desc A',
            slug: 'experiment-a',
            created: '2023-01-01'
        });

        const mockConfigB = JSON.stringify({
            title: 'Experiment B',
            description: 'Desc B',
            slug: 'experiment-b',
            created: '2023-01-02'
        });

        vi.mocked(readdir).mockResolvedValue(mockEntries as any);
        vi.mocked(readFile)
            .mockResolvedValueOnce(mockConfigA)
            .mockResolvedValueOnce(mockConfigB);

        const experiments = await getExperiments();

        expect(experiments).toHaveLength(2);
        expect(experiments[0].slug).toBe('experiment-b'); // Newest first
        expect(experiments[1].slug).toBe('experiment-a');
    });

    it('should filter out non-experiment directories', async () => {
        const mockEntries = [
            { isDirectory: () => true, name: '(index)' },
            { isDirectory: () => true, name: 'random-dir' },
            { isDirectory: () => false, name: 'file.txt' },
            { isDirectory: () => true, name: '(valid-experiment)' }
        ];

        const mockConfig = JSON.stringify({
            title: 'Valid',
            description: 'Valid',
            slug: 'valid-experiment',
            created: '2023-01-01'
        });

        vi.mocked(readdir).mockResolvedValue(mockEntries as any);
        vi.mocked(readFile).mockResolvedValue(mockConfig);

        const experiments = await getExperiments();

        expect(experiments).toHaveLength(1);
        expect(experiments[0].slug).toBe('valid-experiment');
    });
});
