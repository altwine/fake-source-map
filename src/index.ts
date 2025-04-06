import { SourceMapGenerator } from 'source-map';
import { writeFileSync, readFileSync } from 'fs';

export type FakeSourceMapGeneratorOptions = {
    filename?: string;
    skipWhitespaces?: boolean;
};

export class FakeSourceMapGenerator {
    private skipWhitespaces: boolean;
    private filename: string;
    private sourceMap: SourceMapGenerator;

    constructor(options: FakeSourceMapGeneratorOptions = {}) {
        this.skipWhitespaces = options.skipWhitespaces ?? false;
        this.filename = options.filename ?? 'unknown.js';
        this.sourceMap = new SourceMapGenerator({ file: this.filename });
    }

    private createMappings(realCode: string, fakeCode: string) {
        if (!realCode || !fakeCode) return;

        const srcLines = fakeCode.split('\n');
        const srcLinesLength = srcLines.length;

        if (srcLinesLength === 0) return;
        if (this.skipWhitespaces && fakeCode.trim().split('\n').length === 0) return;

        this.sourceMap.setSourceContent(this.filename, fakeCode);

        const genLines = realCode.split('\n');
        const genLinesLength = genLines.length;
        for (let line = 1; genLinesLength > line - 1; ++line) {
            const genLine = genLines[line - 1];
            const genLineLength = genLine.length + (this.skipWhitespaces ? 0 : 1);
            for (let column = 0; column <= genLineLength; ++column) {
                if (this.skipWhitespaces) {
                    const char = genLine[column];
                    if (char === ' ' || char === '\t' || char === '\r') continue;
                }
                const srcLine = Math.floor(Math.random() * srcLines.length);
                const srcCol = Math.floor(Math.random() * (srcLines[srcLine]?.length ?? 0));
                this.sourceMap.addMapping({
                    generated: { line, column },
                    original: { line: srcLine + 1, column: srcCol },
                    source: this.filename,
                });
            }
        }
    }

    public fromFile(filepath: string, fakeCode: string) {
        try {
            const realCode = readFileSync(filepath, 'utf8');
            this.createMappings(realCode, fakeCode);
        } catch (e) {
            console.error(`Cant read file: ${filepath}`, e);
        }
    }

    public fromString(realCode: string, fakeCode: string) {
        this.createMappings(realCode, fakeCode);
    }

    public toJSON() {
        return this.sourceMap.toJSON();
    }

    public toString() {
        return this.sourceMap.toString();
    }

    public toBase64() {
        return btoa(this.toString());
    }

    public toInlinable() {
        return '//# sourceMappingURL=data:application/json;base64,' + this.toBase64();
    }

    public appendToFile(filepath: string) {
        try {
            const existingContent = readFileSync(filepath, 'utf8');
            const appended = `${existingContent}\n${this.toInlinable()}`;
            writeFileSync(filepath, appended);
        } catch (e) {
            console.error(`Failed to append source map to file: ${filepath}`, e);
        }
    }
}
