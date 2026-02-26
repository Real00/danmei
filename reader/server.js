try {
  require("./dist/server.js");
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Build output not found. Run `pnpm build` first.");
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
}
