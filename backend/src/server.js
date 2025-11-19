import dotenv from "dotenv";
import app from "./app.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`TrustDrive API listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });



