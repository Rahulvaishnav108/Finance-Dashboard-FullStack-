import { model } from "mongoose";
import { IBill } from "./billing.schema";
import billingSchema from "./billing.schema";

export const BillingModel = model<IBill>("Bill", billingSchema);