import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import adminOrdersRouter from "./adminOrders";
import adminProductsRouter from "./adminProducts";
import adminDashboardRouter from "./adminDashboard";
import uploadsRouter from "./uploads";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(uploadsRouter);
router.use(paymentsRouter);
router.use(adminRouter);
router.use(adminOrdersRouter);
router.use(adminProductsRouter);
router.use(adminDashboardRouter);

export default router;
