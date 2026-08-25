import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

/**
 * Boots a Next server for the checks to drive, and — importantly — guarantees it
 * is killed again. A leaked dev server holds port 3000 and the next run fails
 * with an error that looks nothing like its cause.
 */

export interface Server {
  url: string;
  mode: 'dev' | 'prod';
  stop: () => Promise<void>;
}

const isWindows = process.platform === 'win32';

async function waitForReady(url: string, timeoutMs: number, proc: ChildProcess): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      throw new Error(`server exited early with code ${proc.exitCode}`);
    }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok || res.status === 404) return;
    } catch {
      /* not up yet */
    }
    await sleep(300);
  }
  throw new Error(`server did not become ready at ${url} within ${timeoutMs}ms`);
}

export async function startServer(mode: 'dev' | 'prod', port = 3000): Promise<Server> {
  const url = `http://localhost:${port}`;

  const proc = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['run', mode === 'dev' ? 'dev' : 'start', '--', '-p', String(port)],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      env: { ...process.env, NODE_ENV: mode === 'dev' ? 'development' : 'production' },
    },
  );

  // Drain the pipes; a full stdio buffer stalls the child on Windows.
  proc.stdout?.resume();
  proc.stderr?.resume();

  await waitForReady(url, 120_000, proc);
  // The dev server answers before it has finished its first compile. Give the
  // route a warm-up request so the first real navigation isn't measuring webpack.
  await fetch(`${url}/probe`).catch(() => undefined);

  return {
    url,
    mode,
    stop: async () => {
      if (proc.exitCode !== null) return;
      if (isWindows && proc.pid) {
        // next spawns a child of its own; taskkill /T is the only reliable way
        // to take the whole tree down and release the port.
        spawn('taskkill', ['/pid', String(proc.pid), '/f', '/t'], { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
      await sleep(700);
    },
  };
}
