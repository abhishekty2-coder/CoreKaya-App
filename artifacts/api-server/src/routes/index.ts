import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workoutsRouter from "./workouts";
import productsRouter from "./products";
import scheduleRouter from "./schedule";
import userRouter from "./user";
import quotesRouter from "./quotes";
import adminRouter from "./admin";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(workoutsRouter);
router.use(productsRouter);
router.use(scheduleRouter);
router.use(userRouter);
router.use(quotesRouter);
router.use(adminRouter);
router.use(aiRouter);

export default router;
