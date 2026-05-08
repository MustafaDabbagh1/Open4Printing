import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
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
const corsOriginEnv = process.env["CORS_ORIGIN"];
const corsOrigins = corsOriginEnv
  ? corsOriginEnv.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
if (corsOrigins.length > 0) {
  app.use(cors({ credentials: true, origin: corsOrigins }));
}
// Default: same-origin only (frontend and API are served behind the same proxy).
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
