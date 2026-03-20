import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import grossistesRouter from "./grossistes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/grossistes/:grossisteId", grossistesRouter);

export default router;
