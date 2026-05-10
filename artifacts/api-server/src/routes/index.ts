import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import adminOrdersRouter from "./adminOrders";
import adminProductsRouter from "./adminProducts";
import adminDashboardRouter from "./adminDashboard";
import uploadsRouter from "./uploads";
import paymentsRouter from "./payments";
import quotesRouter from "./quotes";
import couponsRouter from "./coupons";
import customersRouter from "./customers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(uploadsRouter);
router.use(paymentsRouter);
router.use(quotesRouter);
router.use(couponsRouter);
router.use(customersRouter);
router.use(adminRouter);
router.use(adminOrdersRouter);
router.use(adminProductsRouter);
router.use(adminDashboardRouter);

export default router;
