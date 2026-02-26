import { createApp } from "./app";
import { PORT } from "./config";

const app = createApp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Reader server: http://localhost:${PORT}`);
});
