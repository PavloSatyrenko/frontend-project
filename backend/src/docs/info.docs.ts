import { Paths } from "swagger-jsdoc";

export const infoDocs: Paths = {
    "/info/products": {
        put: {
            summary: "Update products database",
            description: "Updates the products database with new information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All operations are logged\n\n" +
                "Validation requirements:\n" +
                "• Must be valid binary data\n" +
                "• Maximum file size: 100MB\n" +
                "• Content must be application/octet-stream\n" +
                "• CSV format with columns: Бренд, Артикул, Кількість, Ціна, Назва, Фото, Опис, Коментар, Доставка, Група, Постачальник\n\n" +
                "Processing details:\n" +
                "• Inserts new products or updates existing ones based on unique constraint (code, manufacturer, supplier)\n" +
                "• Products not in the CSV are deactivated (isActive = false)\n" +
                "• Automatically links products to categories based on 'Група' column matching category csvId\n" +
                "• Updates daysBeforeDelivery field from 'Доставка' column\n" +
                "• Only updates records when values actually change (performance optimization)\n\n" +
                "Important: This endpoint modifies core products database information. Use with caution.",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data containing database update information"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Database updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Database updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Internal server error"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/info/store-products": {
        put: {
            summary: "Update store products database",
            description: "Updates the store products database with new information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All operations are logged\n\n" +
                "Validation requirements:\n" +
                "• Must be valid binary data\n" +
                "• Maximum file size: 100MB\n" +
                "• Content must be application/octet-stream\n" +
                "• CSV format with store-specific product data\n\n" +
                "Processing details:\n" +
                "• Updates store-specific product information\n" +
                "• Manages inventory and availability for store products\n" +
                "• Only updates records when values actually change (performance optimization)\n\n" +
                "Important: This endpoint modifies store products database information. Use with caution.",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data containing store products database update information"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Store products database updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Database updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Internal server error"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/info/supply-products": {
        put: {
            summary: "Update supply products database",
            description: "Updates the supply products database with new information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All operations are logged\n\n" +
                "Validation requirements:\n" +
                "• Must be valid binary data\n" +
                "• Maximum file size: 100MB\n" +
                "• Content must be application/octet-stream\n" +
                "• CSV format with supply-specific product data\n\n" +
                "Processing details:\n" +
                "• Updates supply chain product information\n" +
                "• Manages supplier inventory and pricing\n" +
                "• Only updates records when values actually change (performance optimization)\n\n" +
                "Important: This endpoint modifies supply products database information. Use with caution.",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data containing supply products database update information"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Supply products database updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Database updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Internal server error"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/info/analogs": {
        put: {
            summary: "Update analogs database",
            description: "Updates the analogs database with new information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All operations are logged\n\n" +
                "Validation requirements:\n" +
                "• Must be valid binary data\n" +
                "• Maximum file size: 100MB\n" +
                "• Content must be application/octet-stream\n" +
                "• CSV format with columns: NAME_PARTS, mainART_BRANDS, mainART_CODE_PARTS, TTC_ART_ID, BRANDS, CODE_PARTS, CODE_PARTS_ADVANCED\n" +
                "• File encoding: Windows-1251\n" +
                "• Delimiter: semicolon (;)\n\n" +
                "Processing details:\n" +
                "• Creates bidirectional analog relationships between products\n" +
                "• Matches products by code and manufacturer\n" +
                "• Prevents duplicate relationships (ON CONFLICT DO NOTHING)\n" +
                "• Only processes valid product pairs (both products must exist)\n\n" +
                "Important: This endpoint modifies core analogs database information. Use with caution.",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data containing analogs database update information"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Analogs database updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Database updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Internal server error"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/info/categories": {
        put: {
            summary: "Update categories database",
            description: "Updates the categories database with new information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All operations are logged\n\n" +
                "Validation requirements:\n" +
                "• Must be valid binary data\n" +
                "• Maximum file size: 100MB\n" +
                "• Content must be application/octet-stream\n" +
                "• CSV format with columns: Id, Name, Parent_Id\n\n" +
                "Processing details:\n" +
                "• New UUIDs are generated for each category (CSV Id is stored as csvId for reference)\n" +
                "• Preserves category hierarchy based on Parent_Id\n" +
                "• Uses csvId for stable references across updates\n" +
                "• Upserts categories: inserts new ones or updates existing ones based on csvId\n" +
                "• Deletes categories only if they're not in CSV AND have no products assigned\n" +
                "• Categories with products are preserved even if removed from CSV (to maintain product links)\n" +
                "• Parent-child relationships are established after all categories are inserted/updated\n\n" +
                "Important: This endpoint modifies core categories database information. Categories with assigned products are protected from deletion.",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data containing categories database update information"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Categories database updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Database updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Internal server error"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "/info/upload": {
        put: {
            summary: "Upload file to storage",
            description: "Uploads a binary file to cloud storage.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Password authentication required (query parameter)\n" +
                "• All uploads are logged\n\n" +
                "Storage details:\n" +
                "• Files are stored in 'DB files' bucket\n" +
                "• Filename includes timestamp prefix\n" +
                "• Previous versions are preserved\n" +
                "• Uses upsert strategy (overwrites if exists)\n\n" +
                "Validation requirements:\n" +
                "• Content-Type: Must be 'application/octet-stream'\n" +
                "• File: Must be a valid binary file\n" +
                "• File size: Maximum 100MB\n" +
                "• File cannot be empty",
            tags: ["Info"],
            parameters: [
                {
                    name: "password",
                    in: "query",
                    description: "Database update password for authentication",
                    required: true,
                    schema: {
                        type: "string",
                        example: "your-secure-password"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/octet-stream": {
                        schema: {
                            type: "string",
                            format: "binary",
                            description: "Binary file data to upload to storage (max 100MB)"
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "File uploaded successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "File uploaded successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Bad request - validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Invalid password" },
                                            { example: "Server configuration error: valid password not set" },
                                            { example: "Invalid file format. File data expected" },
                                            { example: "File cannot be empty" },
                                            { example: "File size exceeds maximum allowed size of 100MB" },
                                            { example: "Invalid content type. Expected application/octet-stream" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Internal server error or upload failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Failed to upload file to storage" },
                                            { example: "Internal server error" }
                                        ]
                                    },
                                    error: {
                                        type: "object",
                                        description: "Storage error details (when upload fails)"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};