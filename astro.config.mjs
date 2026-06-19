import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Su GitHub Actions GITHUB_REPOSITORY vale "owner/repo".
// Da qui ricaviamo automaticamente site + base, così il deploy funziona
// con qualsiasi username/nome repo senza modifiche manuali.
const ghRepo = process.env.GITHUB_REPOSITORY;
const [owner, repoName] = ghRepo ? ghRepo.split('/') : [];
const onCI = Boolean(ghRepo);

export default defineConfig({
  output: 'static',
  site: onCI ? `https://${owner}.github.io` : 'http://localhost:4321',
  base: onCI ? `/${repoName}/` : '/',
  integrations: [tailwind(), react()],
});
