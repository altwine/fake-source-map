jest.mock('source-map', () => ({
    SourceMapGenerator: jest.fn(() => ({
        setSourceContent: jest.fn(),
        addMapping: jest.fn(),
        toJSON: jest.fn(() => ({ version: 3 })),
        toString: jest.fn(() => 'test-map'),
    })),
}));

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => 'file-content'),
    writeFileSync: jest.fn(),
    appendFileSync: jest.fn(),
}));

import { FakeSourceMapGenerator } from './index';
import { appendFileSync, readFileSync } from 'fs';

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
        generator.appendToFile('output.js');
        expect(appendFileSync).toHaveBeenCalledWith(
            'output.js',
            '\n//# sourceMappingURL=data:application/json;base64,dGVzdC1tYXA=',
        );
    });

    it('should handle file read errors', () => {
        (readFileSync as jest.Mock).mockImplementationOnce(() => {
            throw new Error('Read error');
        });
        expect(() => generator.fromFile('missing.js', '')).toThrow(
            'Failed to read or process file: missing.js - Read error',
        );
    });
});
