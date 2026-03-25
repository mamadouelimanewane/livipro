import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import grossistesRouter from "./grossistes";
import innovationsRouter from "./innovations";
import commandesRouter from "./commandes";
import authRouter from "./auth";
import documentsRouter from "./documents";
import notificationsRouter from "./notifications";
import retoursRouter from "./retours";
import promotionsRouter from "./promotions";
import facturesRouter from "./factures";
import depotsRouter from "./depots";
import auditRouter from "./audit";
import congesRouter from "./conges";
import exportcsvRouter from "./exportcsv";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/grossistes/:grossisteId", grossistesRouter);
router.use("/grossistes/:grossisteId/innovations", innovationsRouter);
router.use("/grossistes/:grossisteId", commandesRouter);
router.use("/grossistes/:grossisteId", documentsRouter);
router.use("/grossistes/:grossisteId", notificationsRouter);
router.use("/grossistes/:grossisteId", retoursRouter);
router.use("/grossistes/:grossisteId", promotionsRouter);
router.use("/grossistes/:grossisteId", facturesRouter);
router.use("/grossistes/:grossisteId", depotsRouter);
router.use("/grossistes/:grossisteId", auditRouter);
router.use("/grossistes/:grossisteId", congesRouter);
router.use("/grossistes/:grossisteId", exportcsvRouter);

export default router;
