import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    'scripts/seed-admin': 'src/scripts/seed-admin.ts',
  },
  // package.json is "type": "commonjs", so a single CJS build is enough
  format: ['cjs'],
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  bundle: true,
  splitting: false,
  sourcemap: true,
})
