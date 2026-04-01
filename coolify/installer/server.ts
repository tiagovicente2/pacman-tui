import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const repo = (process.env.PACMAN_TUI_REPO ?? '').trim();
const installScriptPath = join(import.meta.dir, '..', '..', 'install.sh');
const installScriptTemplate = readFileSync(installScriptPath, 'utf8');

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function buildInstallScript(repoName: string): string {
  const shebang = '#!/usr/bin/env sh\n';
  const scriptBody = installScriptTemplate.startsWith(shebang)
    ? installScriptTemplate.slice(shebang.length)
    : installScriptTemplate;

  return `${shebang}PACMAN_TUI_REPO=${shellQuote(repoName)}\nexport PACMAN_TUI_REPO\n${scriptBody}`;
}

const server = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/healthz') {
      return new Response('ok\n', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (url.pathname === '/install.sh') {
      if (!repo) {
        return new Response('Missing PACMAN_TUI_REPO on server\n', {
          status: 500,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
      }

      return new Response(buildInstallScript(repo), {
        headers: {
          'content-type': 'text/x-shellscript; charset=utf-8',
          'cache-control': 'no-store',
        },
      });
    }

    const installUrl = `${url.origin}/install.sh`;
    const body = [
      'pacman-tui installer service',
      '',
      `curl -fsSL ${installUrl} | sh`,
      '',
      'Set PACMAN_TUI_REPO on this service to owner/repo.',
      '',
    ].join('\n');

    return new Response(body, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  },
});

console.log(`installer server listening on http://localhost:${server.port}`);
