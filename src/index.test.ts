jest.mock('source-map', () => ({
    SourceMapGenerator: jest.fn(() => ({
        setSourceContent: jest.fn(),
        addMapping: jest.fn(),
        toJSON: jest.fn(() => {
            version: 3;
        }),
        toString: jest.fn(() => 'test-map'),
    })),
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => 'file-content'),
    writeFileSync: jest.fn(),
}));

import { FakeSourceMapGenerator } from './index';
import { readFileSync, writeFileSync } from 'fs';

describe('FakeSourceMapGenerator File Operations', () => {
    let generator: FakeSourceMapGenerator;

    beforeEach(() => {
        generator = new FakeSourceMapGenerator({ filename: 'test.js' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should read from file and generate mappings', () => {
        generator.fromFile('input.js', 'original-content');
        expect(readFileSync).toHaveBeenCalledWith('input.js', 'utf8');
    });

    it('should append source map to file', () => {
        (readFileSync as jest.Mock).mockReturnValueOnce('existing-content');
        generator.appendToFile('output.js');
        expect(writeFileSync).toHaveBeenCalledWith(
            'output.js',
            'existing-content\n//# sourceMappingURL=data:application/json;base64,dGVzdC1tYXA=',
        );
    });

    it('should handle file read errors', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (readFileSync as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Read error');
        });
        generator.fromFile('missing.js', '');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
