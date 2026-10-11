import { existsSync } from 'node:fs';

// Import this first. It loads api/.env when running locally; on Render the
// variables are set in its dashboard instead, so there is no file to read.
if (existsSync('.env')) process.loadEnvFile();
