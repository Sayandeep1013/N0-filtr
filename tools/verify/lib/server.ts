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

  /* Refuse to run against a server we did not start.
     `next dev` on an occupied port quietly moves to 3001 and says so in output
     nobody reads, so without this check the harness happily drives whatever is
     already on 3000 — your own `npm run dev`, with your uncommitted edits in it
     — reports green, and then fails at teardown because the process it tries to
     kill is not the one holding the port. That is the run this check was
     written after. Better to stop with an instruction than to verify the wrong
     build. */
  const occupied = await fetch(url, { signal: AbortSignal.timeout(1500) })
    .then(() => true)
    .catch(() => false);
  if (occupied) {
    throw new Error(
      `something is already serving ${url}.\n` +
        'verify must own its server — a dev server you started has your unsaved state in it,\n' +
        'and the teardown cannot kill a process it did not spawn. Stop it first:\n' +
        `  Get-NetTCPConnection -LocalPort ${port} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
    );
  }

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
      if (proc.exitCode === null) {
        if (isWindows && proc.pid) {
          // next spawns a child of its own; taskkill /T is the only reliable way
          // to take the whole tree down and release the port.
          await run('taskkill', ['/pid', String(proc.pid), '/f', '/t']);
        } else {
          proc.kill('SIGTERM');
        }
      }
      await waitForPortFree(url, port);
    },
  };
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'ignore' });
    child.on('exit', () => resolve());
    child.on('error', () => resolve());
  });
}

/**
 * **`stop()` is not done when the kill is issued — it is done when the port is
 * free.** This function is the difference between a run that fails and one that
 * fails *and* poisons every build after it.
 *
 * The failure it exists to prevent, observed on 2026-08-26: `verify` stopped the
 * dev server, the production build then threw, and something in the dev server's
 * process tree outlived the `taskkill` and kept a handle on `.next`. Every
 * subsequent `next build` — including ones run by hand, on a clean checkout,
 * hours later — died in "Collecting page data" with
 * `PageNotFoundError: Cannot find module for page: /icon.svg`. That message
 * names a route, says nothing about a lock, and sends you looking at your app.
 *
 * The old teardown fired `taskkill` without waiting for it and slept 700ms.
 * Both halves were wrong: an unawaited kill can still be queued when the sleep
 * ends, and 700ms is a guess about a machine rather than an observation of one.
 * We now await the kill and then poll until the port actually refuses a
 * connection — and if it never does, we say so, loudly, instead of letting the
 * next step inherit the mess.
 */
async function waitForPortFree(url: string, port: number, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(1000) });
    } catch {
      // Connection refused — nothing is listening. That is what done looks like.
      return;
    }
    await sleep(250);
  }
  throw new Error(
    `port ${port} is still serving ${timeoutMs}ms after the server was killed.\n` +
      "Something in the server's process tree survived. Kill it before building, or the\n" +
      'next `next build` will fail in "Collecting page data" with a PageNotFoundError\n' +
      'that has nothing to do with your pages:\n' +
      `  Get-NetTCPConnection -LocalPort ${port} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`,
  );
}
