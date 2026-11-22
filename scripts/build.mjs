import { build } from 'vite';
import { cp } from 'node:fs/promises';
await build();
for (const path of ['app.js', 'content.js', 'motion.js', 'styles.css', 'effects.css', 'assets']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
