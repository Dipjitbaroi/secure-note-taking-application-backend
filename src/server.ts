import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// On Vercel the platform calls the exported app for each request,
// so only start a long-running server everywhere else.
if (!process.env.VERCEL) {
  main().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

export default app;
