import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swager";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "routes/category.routes";
import filterRoutes from "routes/filter.routes";
import productRoutes from "routes/product.routes";
import infoRoutes from "routes/info.routes";
import clientRoutes from "routes/client.routes";
import orderRoutes from "routes/order.routes";
import cartRoutes from "routes/cart.routes";
import vinRoutes from "routes/vin.routes";
import galleryRoutes from "routes/gallery.routes";
import configRoutes from "routes/config.routes";
import { generalLimiter } from "middlewares/limiter";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins: string[] = [
                "http://localhost:4200",
                "http://localhost:3000",
                "https://autoshop22-dev.web.app",
                "https://intermediate-darci-authoshop22-148dcce5.koyeb.app",
            ];

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.use(express.json({ type: "application/json" }));
app.use(express.raw({ type: "application/octet-stream", limit: "100mb" }));
app.use(cookieParser());

app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/category", generalLimiter, categoryRoutes);
app.use("/filter", generalLimiter, filterRoutes);
app.use("/product", generalLimiter, productRoutes);
app.use("/client", generalLimiter, clientRoutes);
app.use("/order", generalLimiter, orderRoutes);
app.use("/cart", generalLimiter, cartRoutes);
app.use("/info", generalLimiter, infoRoutes);
app.use("/vin", generalLimiter, vinRoutes);
app.use("/gallery", generalLimiter, galleryRoutes);
app.use("/config", generalLimiter, configRoutes);

export default app;
