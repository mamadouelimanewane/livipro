import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const rootDir = process.cwd();
  const grossistePublic = path.join(rootDir, "artifacts/grossiste-backoffice/dist/public");
  const adminPublic = path.join(rootDir, "artifacts/admin-backoffice/dist/public");

  app.use("/grossiste", express.static(grossistePublic));
  app.get("/grossiste/*", (_req: Request, res: Response) => {
    res.sendFile(path.join(grossistePublic, "index.html"));
  });

  app.use(express.static(adminPublic));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(adminPublic, "index.html"));
  });
}

export default app;
