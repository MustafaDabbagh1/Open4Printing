import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import { ValidateCouponBody, ValidateCouponResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const code = parsed.data.code.trim().toUpperCase();
  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(and(eq(couponsTable.code, code), eq(couponsTable.active, true)));
  if (!coupon) {
    res.status(404).json({ error: "Coupon not found or inactive" });
    return;
  }

  const subtotal = Number(parsed.data.subtotal);
  let discount = 0;
  if (coupon.percentOff != null) {
    discount = +(subtotal * (coupon.percentOff / 100)).toFixed(2);
  } else if (coupon.amountOff != null) {
    discount = Math.min(subtotal, Number(coupon.amountOff));
  }

  res.json(
    ValidateCouponResponse.parse({
      code: coupon.code,
      description: coupon.description,
      percentOff: coupon.percentOff,
      amountOff: coupon.amountOff != null ? Number(coupon.amountOff) : null,
      discountAmount: discount,
    }),
  );
});

export default router;
