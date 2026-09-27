import express from "express";
import type { Request, Response } from "express";

const app = express();
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Natours API running");
});

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

export default server;
