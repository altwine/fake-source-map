# fake-source-map 🗺️
Prank devtools bros :-)

## API usage
Use the "FakeSourceMapGenerator" class.
```ts
import { FakeSourceMapGenerator } from 'fake-source-map';
import path from 'node:path';

const file = './my-real-code.js';
const fakeCode = '\n   (its over...)\n (-_-)\n';

const filename = path.basename(file);
const fsmg = new FakeSourceMapGenerator({ filename });
fsmg.fromFile(file, fakeCode);
fsmg.appendToFile(file);
```