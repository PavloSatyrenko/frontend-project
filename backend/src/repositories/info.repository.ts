import { PrismaClient } from "@prisma/client"
import { Client as PostgresClient } from "pg";
import { from as copyFrom, CopyStreamQuery } from "pg-copy-streams";
import { createClient } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import { DATABASE_URL, SUPABASE_KEY, SUPABASE_URL } from "config/env";

const prisma: PrismaClient = new PrismaClient();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const infoRepository = {
    async updateProductsDatabase(fileBuffer: Buffer): Promise<void> {
        const postgresClient: PostgresClient = new PostgresClient({
            connectionString: DATABASE_URL,
        });

        try {
            await postgresClient.connect();

            // Start a transaction
            await postgresClient.query("BEGIN");

            // Create staging table
            await postgresClient.query(`
                DROP TABLE IF EXISTS staging_products_table;
                CREATE TABLE staging_products_table (
                    "Бренд" TEXT NOT NULL,
                    "Артикул" TEXT NOT NULL,
                    "Кількість" INT NOT NULL,
                    "Ціна" NUMERIC(10, 2) NOT NULL,
                    "Назва" TEXT NULL,
                    "Фото" TEXT NULL,
                    "Опис" TEXT NULL,
                    "Коментар" TEXT NULL,
                    "Доставка" INT NOT NULL,
                    "Група" TEXT NULL,
                    "Постачальник" TEXT NOT NULL,
                    UNIQUE("Бренд", "Артикул", "Постачальник")
                );
            `);

            // Import data from csv file to the new table
            await new Promise((resolve, reject) => {
                const copyStream: CopyStreamQuery = postgresClient.query(copyFrom(`COPY staging_products_table FROM STDIN WITH CSV HEADER`));

                copyStream.on("error", reject);
                copyStream.on("finish", resolve);

                copyStream.write(fileBuffer);
                copyStream.end();
            });

            // Update only changed existing records
            await postgresClient.query(`
                INSERT INTO "Product" (id, code, name, price, manufacturer, supplier, amount, image, "isActive", "daysBeforeDelivery")
                SELECT gen_random_uuid(),
                    TRIM("Артикул"),
                    COALESCE(REGEXP_REPLACE(TRIM("Назва"), '^[\\s]+|[\\s]+$', '', 'g'), ''),
                    "Ціна",
                    TRIM("Бренд"),
                    TRIM("Постачальник"),
                    "Кількість",
                    COALESCE(string_to_array("Фото", ';'), ARRAY[]::text[]),
                    true,
                    "Доставка"
                FROM staging_products_table
                ON CONFLICT (code, manufacturer, supplier) DO UPDATE SET
                    name = COALESCE(REGEXP_REPLACE(TRIM(EXCLUDED.name), '^[\\s]+|[\\s]+$', '', 'g'), ''),
                    price = EXCLUDED.price,
                    manufacturer = TRIM(EXCLUDED.manufacturer),
                    supplier = TRIM(EXCLUDED.supplier),
                    amount = EXCLUDED.amount,
                    image = EXCLUDED.image,
                    "daysBeforeDelivery" = EXCLUDED."daysBeforeDelivery"
                WHERE "Product".name IS DISTINCT FROM COALESCE(REGEXP_REPLACE(TRIM(EXCLUDED.name), '^[\\s]+|[\\s]+$', '', 'g'), '')
                    OR "Product".price IS DISTINCT FROM EXCLUDED.price
                    OR "Product".manufacturer IS DISTINCT FROM TRIM(EXCLUDED.manufacturer)
                    OR "Product".supplier IS DISTINCT FROM TRIM(EXCLUDED.supplier)
                    OR "Product".amount IS DISTINCT FROM EXCLUDED.amount
                    OR "Product".image IS DISTINCT FROM EXCLUDED.image
                    OR "Product"."daysBeforeDelivery" IS DISTINCT FROM EXCLUDED."daysBeforeDelivery"
            `);

            // Deactivate products that are no longer in the CSV
            await postgresClient.query(`
                UPDATE "Product"
                SET "isActive" = false
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM staging_products_table
                    WHERE TRIM(staging_products_table."Артикул") = "Product".code
                        AND TRIM(staging_products_table."Бренд") = "Product".manufacturer
                )
            `);

            // Update products availability based on isActive status
            await postgresClient.query(`
                UPDATE "Product"
                SET availability = CASE
                    WHEN "isActive" = true THEN 'AVAILABLE'::"Availability"
                    ELSE 'NOT_AVAILABLE'::"Availability"
                END
            `);

            // Update products with category IDs array based on group column
            await postgresClient.query(`
                UPDATE "Product" p
                SET "categoryIds" = (
                    SELECT array_agg(DISTINCT c.id)
                    FROM unnest(string_to_array(spt."Група", ';')) AS category_csv_id
                    INNER JOIN "Category" c ON c."csvId" = category_csv_id
                )
                FROM staging_products_table spt
                WHERE p.code = TRIM(spt."Артикул") 
                    AND p.manufacturer = TRIM(spt."Бренд")
                    AND p.supplier = TRIM(spt."Постачальник")
                    AND spt."Група" IS NOT NULL 
                    AND spt."Група" != ''
            `);

            // Clean up staging table
            await postgresClient.query(`DROP TABLE IF EXISTS staging_products_table`);

            // Commit the transaction
            await postgresClient.query("COMMIT");
        }
        catch (error) {
            // Rollback the transaction on error
            await postgresClient.query("ROLLBACK");
            console.error("Transaction rolled back due to error:", error);
            throw error;
        }
        finally {
            await postgresClient.end();
        }
    },

    async updateAnalogsDatabase(fileBuffer: Buffer): Promise<void> {
        const postgresClient: PostgresClient = new PostgresClient({
            connectionString: DATABASE_URL,
        });

        try {
            await postgresClient.connect();

            // Start a transaction
            await postgresClient.query("BEGIN");

            // Create staging table
            await postgresClient.query(`
                DROP TABLE IF EXISTS staging_analogs_table;
                CREATE TABLE staging_analogs_table (
                    "NAME_PARTS" TEXT NULL,
                    "mainART_BRANDS" TEXT NULL,
                    "mainART_CODE_PARTS" TEXT NULL,
                    "TTC_ART_ID" TEXT NULL,
                    "BRANDS" TEXT NULL,
                    "CODE_PARTS" TEXT NULL,
                    "CODE_PARTS_ADVANCED" TEXT NULL
                );
            `);

            // Import data from csv file to the new table
            await new Promise((resolve, reject) => {
                const copyStream: CopyStreamQuery = postgresClient.query(
                    copyFrom(`COPY staging_analogs_table FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ';', ENCODING 'win1251')`)
                );

                copyStream.on("error", reject);
                copyStream.on("finish", resolve);

                copyStream.write(fileBuffer);
                copyStream.end();
            });

            // Update existing records and insert new ones
            await postgresClient.query(`
                INSERT INTO "Analog" ("productId", "analogProductId")
                SELECT 
                    CASE WHEN p1.id < p2.id THEN p1.id ELSE p2.id END as "productId",
                    CASE WHEN p1.id < p2.id THEN p2.id ELSE p1.id END as "analogProductId"
                FROM staging_analogs_table sa
                INNER JOIN "Product" p1
                    ON LOWER(REGEXP_REPLACE(p1.code, '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                        = LOWER(sa."mainART_CODE_PARTS")
                    AND LOWER(REGEXP_REPLACE(p1.manufacturer, '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                        = LOWER(REGEXP_REPLACE(sa."mainART_BRANDS", '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                INNER JOIN "Product" p2
                    ON LOWER(REGEXP_REPLACE(p2.code, '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                        = LOWER(sa."CODE_PARTS")
                    AND LOWER(REGEXP_REPLACE(p2.manufacturer, '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                        = LOWER(REGEXP_REPLACE(sa."BRANDS", '[\\s/\\.\\(\\)\\-\\=\\#]', '', 'g'))
                WHERE p1.id IS NOT NULL
                    AND p2.id IS NOT NULL
                    AND p1.id != p2.id
                ON CONFLICT ("productId", "analogProductId") DO NOTHING
            `);

            // Clean up staging table
            await postgresClient.query(`DROP TABLE IF EXISTS staging_analogs_table`);

            // Commit the transaction
            await postgresClient.query("COMMIT");
        }
        catch (error) {
            // Rollback the transaction on error
            await postgresClient.query("ROLLBACK");
            console.error("Transaction rolled back due to error:", error);
            throw error;
        }
        finally {
            await postgresClient.end();
        }
    },

    async updateCategoriesDatabase(fileBuffer: Buffer): Promise<void> {
        const postgresClient: PostgresClient = new PostgresClient({
            connectionString: DATABASE_URL,
        });

        try {
            await postgresClient.connect();

            // Start a transaction
            await postgresClient.query("BEGIN");

            // Create staging table
            await postgresClient.query(`
                DROP TABLE IF EXISTS staging_categories_table;
                CREATE TABLE staging_categories_table (
                    "Id" INT NOT NULL,
                    "Name" TEXT NOT NULL,
                    "Parent_Id" INT NULL
                );
            `);

            // Import data from csv file to the new table
            await new Promise((resolve, reject) => {
                const copyStream: CopyStreamQuery = postgresClient.query(
                    copyFrom(`COPY staging_categories_table FROM STDIN WITH (FORMAT csv, HEADER true)`)
                );

                copyStream.on("error", reject);
                copyStream.on("finish", resolve);

                copyStream.write(fileBuffer);
                copyStream.end();
            });

            // Delete categories that are no longer in the CSV AND have no products assigned
            await postgresClient.query(`
                DELETE FROM "Category"
                WHERE "csvId" NOT IN (
                    SELECT "Id"::text FROM staging_categories_table
                )
                AND NOT EXISTS (
                    SELECT 1 FROM "Product" WHERE "Category".id = ANY("Product"."categoryIds")
                )
            `);

            // Insert or update categories with generated UUIDs
            await postgresClient.query(`
                INSERT INTO "Category" (id, "csvId", name, "parentId")
                SELECT 
                    gen_random_uuid(),
                    "Id"::text,
                    "Name",
                    NULL
                FROM staging_categories_table
                ON CONFLICT ("csvId") DO UPDATE SET
                    name = EXCLUDED.name,
                    "parentId" = NULL
            `);

            // Update parent relationships based on CSV hierarchy
            await postgresClient.query(`
                UPDATE "Category" c
                SET "parentId" = parent.id
                FROM staging_categories_table sct
                INNER JOIN "Category" parent ON parent."csvId" = sct."Parent_Id"::text
                WHERE c."csvId" = sct."Id"::text
                AND sct."Parent_Id" IS NOT NULL
            `);

            // Clean up staging table
            await postgresClient.query(`DROP TABLE IF EXISTS staging_categories_table`);

            // Commit the transaction
            await postgresClient.query("COMMIT");
        }
        catch (error) {
            // Rollback the transaction on error
            await postgresClient.query("ROLLBACK");
            console.error("Error updating categories database:", error);
            throw error;
        }
        finally {
            await postgresClient.end();
        }
    },

    async uploadFileToStorage(fileBuffer: Buffer, bucketName: string, fileName: string): Promise<StorageError | null> {
        const { error }: { error: StorageError | null } = await supabase.storage
            .from(bucketName)
            .upload(fileName, fileBuffer, {
                contentType: "application/octet-stream",
                upsert: true
            });

        return error;
    }
}