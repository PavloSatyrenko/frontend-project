import swaggerJSDoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";
import { authDocs } from "./auth.docs";
import { categoryDocs } from "./category.docs";
import { filterDocs } from "./filter.docs";
import { productDocs } from "./product.docs";
import { infoDocs } from "./info.docs";
import { clientDocs } from "./client.docs";
import { orderDocs } from "./order.docs";
import { cartDocs } from "./cart.docs";
import { vinDocs } from "./vin.docs";
import { galleryDocs } from "./gallery.docs";
import { configDocs } from "./config.docs";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AutoShop24 API",
            version: "1.0.0",
            description: "Documentation for API AutoShop24",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
                }
            }
        },
        paths: {
            ...authDocs,
            ...categoryDocs,
            ...filterDocs,
            ...productDocs,
            ...clientDocs,
            ...orderDocs,
            ...cartDocs,
            ...vinDocs,
            ...galleryDocs,
            ...infoDocs,
            ...configDocs,
        }
    },
    apis: ["./src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
