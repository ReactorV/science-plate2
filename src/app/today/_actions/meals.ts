"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

const AddMealItemSchema = z.object({
  dayPlanId: z.string(),
  mealId: z.string(),
  foodId: z.string(),
  amountG: z.number().positive(),
});

const AddSupplementSchema = z.object({
  dayPlanId: z.string(),
  nutrientId: z.string(),
  amountCanonical: z.number().positive(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  brand: z.string().optional(),
});

const RemoveMealItemSchema = z.object({
  mealItemId: z.string(),
});

export async function addMealItem(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = AddMealItemSchema.safeParse({
    dayPlanId: formData.get("dayPlanId"),
    mealId: formData.get("mealId"),
    foodId: formData.get("foodId"),
    amountG: Number(formData.get("amountG")),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // TODO: Insert into DB via Drizzle
  // const { dayPlanId, mealId, foodId, amountG } = parsed.data;
  // await db.insert(mealItem).values({ userId: session.user.id, ... });

  return { success: true };
}

export async function addSupplement(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = AddSupplementSchema.safeParse({
    dayPlanId: formData.get("dayPlanId"),
    nutrientId: formData.get("nutrientId"),
    amountCanonical: Number(formData.get("amountCanonical")),
    time: formData.get("time"),
    brand: formData.get("brand") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // TODO: Insert into DB
  return { success: true };
}

export async function removeMealItem(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = RemoveMealItemSchema.safeParse({
    mealItemId: formData.get("mealItemId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // TODO: Delete from DB — scope query to session.user.id to prevent cross-user deletion
  return { success: true };
}
