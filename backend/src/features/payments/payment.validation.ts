import { z } from "zod";
import { objectId } from "../account/account.validation.js";

export const createCheckoutSessionSchema = z.object({
  orderId: objectId,
});
