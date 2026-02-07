import express from "express";
import dotenv from "dotenv";

dotenv.config({});
const app = express();
const port = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.send({ message: "server health is ok." });
});

app.listen(port, () => {
  console.log(`🚀 server is running on port: ${port}`);
});
