import { StringValue } from "ms";

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 4000;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;
export const ACCESS_TOKEN_EXPIRES_IN: StringValue = (process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue) || "15m";
export const REFRESH_TOKEN_EXPIRES_IN: StringValue = (process.env.REFRESH_TOKEN_EXPIRES_IN as StringValue) || "7d";
export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const SUPABASE_URL: string = process.env.SUPABASE_URL!;
export const SUPABASE_KEY: string = process.env.SUPABASE_KEY!;
export const SUPABASE_IMAGE_URL: string = process.env.SUPABASE_IMAGE_URL!;
export const AUTOSELLING_ORDER_URL: string = "";
export const DB_UPDATE_PASSWORD: string = process.env.DB_UPDATE_PASSWORD!;