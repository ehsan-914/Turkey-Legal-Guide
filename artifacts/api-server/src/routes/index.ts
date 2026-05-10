import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import consultationsRouter from "./consultations";
import casesRouter from "./cases";
import messagesRouter from "./messages";
import servicesRouter from "./services";
import statsRouter from "./stats";
import clientRouter from "./client";
import adminClientsRouter from "./admin-clients";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(consultationsRouter);
router.use(casesRouter);
router.use(messagesRouter);
router.use(servicesRouter);
router.use(statsRouter);
router.use(clientRouter);
router.use(adminClientsRouter);

export default router;
