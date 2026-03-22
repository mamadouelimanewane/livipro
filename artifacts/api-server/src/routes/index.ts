import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import grossistesRouter from "./grossistes";
import innovationsRouter from "./innovations";
import commandesRouter from "./commandes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/grossistes/:grossisteId", grossistesRouter);
router.use("/grossistes/:grossisteId/innovations", innovationsRouter);
router.use("/grossistes/:grossisteId", commandesRouter);

export default router;
