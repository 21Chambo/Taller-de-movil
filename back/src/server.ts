import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";

dotenv.config({ path: "../.env" });

const PORT = process.env.API_PORT || 4000;

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend corriendo en: http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Error iniciando el servidor:", error);
  process.exit(1);
});