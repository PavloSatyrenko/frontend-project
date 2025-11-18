import { Paths } from "swagger-jsdoc";

export const productDocs: Paths = {
    "/product": {
        get: {
            summary: "Get products with pagination",
            description: "Retrieves a paginated list of products with comprehensive filtering and sorting options.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Optional authentication - provides favorite status when authenticated\n" +
                "• Public access without authentication\n" +
                "• Responses are cached for performance\n\n" +
                "Pagination features:\n" +
                "• Page-based pagination (default: page 1, 20 items)\n" +
                "• Configurable page size (max 100 items)\n" +
                "• Total count and pages information\n\n" +
                "Advanced filtering:\n" +
                "• Category-based filtering (includes all subcategories)\n" +
                "• Price range filtering\n" +
                "• Manufacturer filtering (multiple allowed)\n" +
                "• Full-text search with smart word matching\n\n" +
                "Sorting options:\n" +
                "• By price (ascending/descending)\n" +
                "• By name (ascending/descending)\n" +
                "• Default: name ascending\n\n" +
                "Response includes:\n" +
                "• Detailed product information\n" +
                "• Stock availability status\n" +
                "• Current prices and discounts\n" +
                "• Favorite status (when authenticated)\n" +
                "• Pagination metadata",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "page",
                    in: "query",
                    description: "Page number for pagination (minimum 1)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1,
                        example: 1
                    }
                },
                {
                    name: "pageSize",
                    in: "query",
                    description: "Number of products per page (minimum 1, maximum 100)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 20,
                        example: 20
                    }
                },
                {
                    name: "sort",
                    in: "query",
                    description: "Sort order for products",
                    required: true,
                    schema: {
                        type: "string",
                        enum: ["priceAsc", "priceDesc", "nameAsc", "nameDesc"],
                        default: "nameAsc",
                        example: "priceAsc"
                    }
                },
                {
                    name: "categoryId",
                    in: "query",
                    description: "Filter products by category ID. This will include products from the specified category AND all its subcategories (recursive).",
                    required: false,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "376e8b09-f32d-4849-bc48-4f69a90a368b"
                    }
                },
                {
                    name: "minPrice",
                    in: "query",
                    description: "Minimum price value for filtering",
                    required: false,
                    schema: {
                        type: "number",
                        format: "float",
                        example: 100
                    }
                },
                {
                    name: "maxPrice",
                    in: "query",
                    description: "Maximum price value for filtering",
                    required: false,
                    schema: {
                        type: "number",
                        format: "float",
                        example: 1000
                    }
                },
                {
                    name: "manufacturers",
                    in: "query",
                    description: "Filter products by manufacturer names. Accepts either a single manufacturer string or multiple manufacturers as separate query parameters (e.g., `?manufacturers=Bosch` or `?manufacturers=Bosch&manufacturers=Mann`). All specified manufacturers are included in results (OR logic).",
                    required: false,
                    schema: {
                        oneOf: [
                            {
                                type: "string",
                                example: "Bosch"
                            },
                            {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                example: ["Bosch", "Mann"]
                            }
                        ]
                    },
                    style: "form",
                    explode: true
                },
                {
                    name: "discounts",
                    in: "query",
                    description: "Filter products by discount status. Accepts either a single discount status string or multiple statuses as separate query parameters (e.g., `?discounts=Зі знижкою` or `?discounts=Зі знижкою&discounts=Без знижки`). Use 'Зі знижкою' for products with discounts and 'Без знижки' for products without discounts. Multiple values use OR logic.",
                    required: false,
                    schema: {
                        oneOf: [
                            {
                                type: "string",
                                enum: ["Зі знижкою", "Без знижки"],
                                example: "Зі знижкою"
                            },
                            {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["Зі знижкою", "Без знижки"]
                                },
                                example: ["Зі знижкою", "Без знижки"]
                            }
                        ]
                    },
                    style: "form",
                    explode: true
                },
                {
                    name: "availability",
                    in: "query",
                    description: "Filter products by availability status. Accepts either a single availability status string or multiple statuses as separate query parameters (e.g., `?availability=AVAILABLE` or `?availability=AVAILABLE&availability=NOT_AVAILABLE`). Use 'AVAILABLE' for products in stock and 'NOT_AVAILABLE' for out-of-stock products. Multiple values use OR logic.",
                    required: false,
                    schema: {
                        oneOf: [
                            {
                                type: "string",
                                enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                example: "AVAILABLE"
                            },
                            {
                                type: "array",
                                items: {
                                    type: "string",
                                    enum: ["AVAILABLE", "NOT_AVAILABLE"]
                                },
                                example: ["AVAILABLE", "NOT_AVAILABLE"]
                            }
                        ]
                    },
                    style: "form",
                    explode: true
                },
                {
                    name: "search",
                    in: "query",
                    description: "Full-text search across product name and code (space separated words treated as AND with per-word OR inside fields)",
                    required: false,
                    schema: {
                        type: "string",
                        example: "filter code123"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved products",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    products: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "Unique identifier for the product",
                                                    example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                                                },
                                                name: {
                                                    type: "string",
                                                    description: "Product name",
                                                    example: "Product 1"
                                                },
                                                code: {
                                                    type: "string",
                                                    description: "Product code",
                                                    example: "P1"
                                                },
                                                manufacturer: {
                                                    type: "string",
                                                    description: "Product manufacturer",
                                                    example: "Manufacturer 1"
                                                },
                                                price: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Product price",
                                                    example: 99.99
                                                },
                                                image: {
                                                    type: "array",
                                                    items: { type: "string", format: "uri" },
                                                    nullable: true,
                                                    description: "Array of product image URLs (first item is primary)",
                                                    example: ["https://example.com/product1.jpg"]
                                                },
                                                daysBeforeDelivery: {
                                                    type: "integer",
                                                    description: "Estimated days before delivery",
                                                    example: 3
                                                },
                                                availability: {
                                                    type: "string",
                                                    enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                                    description: "Product availability status",
                                                    example: "AVAILABLE"
                                                },
                                                categoryIds: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                        format: "uuid"
                                                    },
                                                    description: "Array of category identifiers",
                                                    example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                                },
                                                supplier: {
                                                    type: "string",
                                                    description: "Product supplier",
                                                    example: "Bosch"
                                                },
                                                isActive: {
                                                    type: "boolean",
                                                    description: "Is product active",
                                                    example: true
                                                },
                                                discount: {
                                                    type: "integer",
                                                    description: "Product discount",
                                                    example: 0
                                                },
                                                amount: {
                                                    type: "integer",
                                                    description: "Product amount in stock",
                                                    example: 10
                                                },
                                                isRecommended: {
                                                    type: "boolean",
                                                    description: "Whether the product is recommended",
                                                    example: false
                                                },
                                                isFavorite: {
                                                    type: "boolean",
                                                    description: "Whether the product is in user's favorites (only when authenticated)",
                                                    example: false
                                                }
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: "integer",
                                        description: "Total number of products",
                                        example: 150
                                    },
                                    totalPages: {
                                        type: "integer",
                                        description: "Total number of pages",
                                        example: 8
                                    },
                                    maxPrice: {
                                        type: "number",
                                        format: "float",
                                        description: "Maximum price among filtered products",
                                        example: 9999.99,
                                        nullable: true
                                    },
                                    page: {
                                        type: "integer",
                                        description: "Current page number",
                                        example: 1
                                    },
                                    pageSize: {
                                        type: "integer",
                                        description: "Number of products per page",
                                        example: 20
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed - invalid request parameters",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Page must be a positive integer" },
                                            { example: "Page size must be a positive integer between 1 and 100" },
                                            { example: "Category ID must be a valid UUID" },
                                            { example: "Minimum price must be a positive integer" },
                                            { example: "Maximum price must be a positive integer" },
                                            { example: "Maximum price cannot be less than minimum price" },
                                            { example: "Manufacturers must be a string or an array of strings" },
                                            { example: "Discounts must be 'Зі знижкою' or 'Без знижки' (string or array)" },
                                            { example: "Availability must be 'AVAILABLE' or 'NOT_AVAILABLE' (string or array)" },
                                            { example: "Search must be a string" },
                                            { example: "Sort must be one of the following values: priceAsc, priceDesc, nameAsc, nameDesc" }
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
    "/product/{id}": {
        get: {
            summary: "Get product by ID",
            description: "Retrieves detailed information about a specific product by its unique identifier.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Optional authentication - provides favorite status when authenticated\n" +
                "• Public access without authentication\n" +
                "• Responses are cached for performance\n\n" +
                "Response features:\n" +
                "• Detailed product information\n" +
                "• Current price and discount\n" +
                "• Stock availability status\n" +
                "• Favorite status (when authenticated)\n" +
                "• Supplier information",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Unique identifier of the product",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Product found and returned successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                        format: "uuid",
                                        description: "Product unique identifier",
                                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                                    },
                                    name: {
                                        type: "string",
                                        description: "Product name",
                                        example: "Product 1"
                                    },
                                    code: {
                                        type: "string",
                                        description: "Product code",
                                        example: "P1"
                                    },
                                    manufacturer: {
                                        type: "string",
                                        description: "Product manufacturer",
                                        example: "Manufacturer 1"
                                    },
                                    price: {
                                        type: "number",
                                        format: "float",
                                        description: "Product price",
                                        example: 99.99
                                    },
                                    image: {
                                        type: "array",
                                        items: { type: "string", format: "uri" },
                                        nullable: true,
                                        description: "Array of product image URLs (first item is primary)",
                                        example: ["https://example.com/product1.jpg"]
                                    },
                                    daysBeforeDelivery: {
                                        type: "integer",
                                        description: "Estimated days before delivery",
                                        example: 3
                                    },
                                    availability: {
                                        type: "string",
                                        enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                        description: "Product availability status",
                                        example: "AVAILABLE"
                                    },
                                    categoryIds: {
                                        type: "array",
                                        items: {
                                            type: "string",
                                            format: "uuid"
                                        },
                                        description: "Array of category identifiers",
                                        example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                    },
                                    supplier: {
                                        type: "string",
                                        description: "Product supplier",
                                        example: "Bosch"
                                    },
                                    isActive: {
                                        type: "boolean",
                                        description: "Is product active",
                                        example: true
                                    },
                                    discount: {
                                        type: "integer",
                                        description: "Product discount percentage",
                                        minimum: 0,
                                        maximum: 100,
                                        example: 0
                                    },
                                    amount: {
                                        type: "integer",
                                        description: "Product stock amount",
                                        minimum: 0,
                                        example: 10
                                    },
                                    isRecommended: {
                                        type: "boolean",
                                        description: "Whether the product is recommended",
                                        example: false
                                    },
                                    isFavorite: {
                                        type: "boolean",
                                        description: "Whether the product is in user's favorites (only when authenticated)",
                                        example: false
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "Product not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product not found"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product ID must be a valid UUID"
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
        },
        put: {
            summary: "Update product (Admin only)",
            description: "Updates product discount, recommended status, and analog products.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Validation rules:\n" +
                "• Product ID must be a valid UUID\n" +
                "• Discount must be between 0 and 100 percent\n" +
                "• isRecommended must be a boolean\n" +
                "• analogIds must be an array of valid UUIDs\n" +
                "• A product cannot be an analog of itself",
            tags: ["Product", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Product ID to update",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "123e4567-e89b-12d3-a456-426614174000"
                    }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                discount: {
                                    type: "integer",
                                    description: "Discount percentage (0-100)",
                                    minimum: 0,
                                    maximum: 100,
                                    example: 15
                                },
                                isRecommended: {
                                    type: "boolean",
                                    description: "Whether the product should be recommended",
                                    example: true
                                },
                                analogIds: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "uuid"
                                    },
                                    description: "Array of analog product IDs",
                                    example: ["456e7890-e89b-12d3-a456-426614174000", "789e0123-e89b-12d3-a456-426614174000"]
                                }
                            },
                            required: ["discount", "isRecommended", "analogIds"]
                        }
                    }
                }
            },
            responses: {
                "204": {
                    description: "Product updated successfully"
                },
                "401": {
                    description: "Unauthorized - authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Unauthorized"
                                    }
                                }
                            }
                        }
                    }
                },
                "403": {
                    description: "Forbidden - admin access required",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Access denied"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Product ID must be a valid UUID" },
                                            { example: "Discount is required" },
                                            { example: "Discount must be an integer between 0 and 100" },
                                            { example: "isRecommended is required" },
                                            { example: "isRecommended must be a boolean" },
                                            { example: "Analog IDs must be an array" },
                                            { example: "Analog Product ID must be a valid UUID" },
                                            { example: "A product cannot be an analog of itself" }
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
    "/product/{id}/analogs": {
        get: {
            summary: "Get product analogs",
            description: "Retrieves a list of analog products for a specific product.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Optional authentication\n" +
                "• Public access without authentication\n\n" +
                "Response features:\n" +
                "• Returns list of analog products\n" +
                "• Includes complete product information\n" +
                "• Shows pricing and availability",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Product ID to get analogs for",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "123e4567-e89b-12d3-a456-426614174000"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Product analogs retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            format: "uuid",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        name: {
                                            type: "string",
                                            example: "Engine Oil Filter"
                                        },
                                        code: {
                                            type: "string",
                                            example: "OF-12345"
                                        },
                                        manufacturer: {
                                            type: "string",
                                            example: "Bosch"
                                        },
                                        price: {
                                            type: "number",
                                            example: 25.99
                                        },
                                        image: {
                                            type: "array",
                                            items: { type: "string", format: "uri" },
                                            nullable: true,
                                            example: ["https://example.com/filter.jpg"]
                                        },
                                        daysBeforeDelivery: {
                                            type: "integer",
                                            example: 2
                                        },
                                        availability: {
                                            type: "string",
                                            enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                            example: "AVAILABLE"
                                        },
                                        categoryIds: {
                                            type: "array",
                                            items: {
                                                type: "string",
                                                format: "uuid"
                                            },
                                            example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                        },
                                        discount: {
                                            type: "integer",
                                            example: 10
                                        },
                                        supplier: {
                                            type: "string",
                                            example: "AutoParts Ltd"
                                        },
                                        amount: {
                                            type: "integer",
                                            example: 50
                                        },
                                        isActive: {
                                            type: "boolean",
                                            example: true
                                        },
                                        isRecommended: {
                                            type: "boolean",
                                            example: false
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: { type: "string", example: "Product ID must be a valid UUID" }
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
                                    message: { type: "string", example: "Internal server error" }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    "/product/recommendations": {
        get: {
            summary: "Get recommended products",
            description: "Retrieves a list of products marked as recommended by administrators.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Optional authentication - provides favorite status when authenticated\n" +
                "• Public access without authentication\n\n" +
                "Response includes:\n" +
                "• Recommended products only\n" +
                "• Full product details\n" +
                "• Favorite status (when authenticated)",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved recommended products",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Product unique identifier",
                                            example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Product name",
                                            example: "Product 1"
                                        },
                                        code: {
                                            type: "string",
                                            description: "Product code",
                                            example: "P1"
                                        },
                                        manufacturer: {
                                            type: "string",
                                            description: "Product manufacturer",
                                            example: "Manufacturer 1"
                                        },
                                        price: {
                                            type: "number",
                                            format: "float",
                                            description: "Product price",
                                            example: 99.99
                                        },
                                        image: {
                                            type: "array",
                                            items: { type: "string", format: "uri" },
                                            nullable: true,
                                            description: "Array of product image URLs (first item is primary)",
                                            example: ["https://example.com/product1.jpg"]
                                        },
                                        daysBeforeDelivery: {
                                            type: "integer",
                                            description: "Estimated days before delivery",
                                            example: 3
                                        },
                                        availability: {
                                            type: "string",
                                            enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                            description: "Product availability status",
                                            example: "AVAILABLE"
                                        },
                                        categoryIds: {
                                            type: "array",
                                            items: {
                                                type: "string",
                                                format: "uuid"
                                            },
                                            description: "Array of category identifiers",
                                            example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                        },
                                        supplier: {
                                            type: "string",
                                            description: "Product supplier",
                                            example: "Bosch"
                                        },
                                        isActive: {
                                            type: "boolean",
                                            description: "Is product active",
                                            example: true
                                        },
                                        discount: {
                                            type: "integer",
                                            description: "Product discount percentage",
                                            minimum: 0,
                                            maximum: 100,
                                            example: 0
                                        },
                                        amount: {
                                            type: "integer",
                                            description: "Product stock amount",
                                            minimum: 0,
                                            example: 10
                                        },
                                        isRecommended: {
                                            type: "boolean",
                                            description: "Whether the product is recommended",
                                            example: true
                                        },
                                        isFavorite: {
                                            type: "boolean",
                                            description: "Whether the product is in user's favorites (only when authenticated)",
                                            example: false
                                        }
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

    "/product/me/favorites": {
        get: {
            summary: "Get user's favorite products",
            description: "Retrieves a list of products that the authenticated user has marked as favorites.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Responses are cached for performance\n\n" +
                "Sorting options:\n" +
                "• By price (ascending/descending)\n" +
                "• By name (ascending/descending)\n" +
                "• Default: name ascending",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "sort",
                    in: "query",
                    description: "Sort order for products",
                    required: true,
                    schema: {
                        type: "string",
                        enum: ["priceAsc", "priceDesc", "nameAsc", "nameDesc"],
                        default: "nameAsc",
                        example: "priceAsc"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved favorite products",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Product unique identifier",
                                            example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Product name",
                                            example: "Product 1"
                                        },
                                        code: {
                                            type: "string",
                                            description: "Product code",
                                            example: "P1"
                                        },
                                        manufacturer: {
                                            type: "string",
                                            description: "Product manufacturer",
                                            example: "Manufacturer 1"
                                        },
                                        price: {
                                            type: "number",
                                            format: "float",
                                            description: "Product price",
                                            example: 99.99
                                        },
                                        image: {
                                            type: "array",
                                            items: { type: "string", format: "uri" },
                                            nullable: true,
                                            description: "Array of product image URLs (first item is primary)",
                                            example: ["https://example.com/product1.jpg"]
                                        },
                                        daysBeforeDelivery: {
                                            type: "integer",
                                            description: "Estimated days before delivery",
                                            example: 3
                                        },
                                        availability: {
                                            type: "string",
                                            enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                            description: "Product availability status",
                                            example: "AVAILABLE"
                                        },
                                        categoryIds: {
                                            type: "array",
                                            items: {
                                                type: "string",
                                                format: "uuid"
                                            },
                                            description: "Array of category identifiers",
                                            example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                        },
                                        supplier: {
                                            type: "string",
                                            description: "Product supplier",
                                            example: "Bosch"
                                        },
                                        isActive: {
                                            type: "boolean",
                                            description: "Is product active",
                                            example: true
                                        },
                                        discount: {
                                            type: "integer",
                                            description: "Product discount percentage",
                                            minimum: 0,
                                            maximum: 100,
                                            example: 0
                                        },
                                        amount: {
                                            type: "integer",
                                            description: "Product stock amount",
                                            minimum: 0,
                                            example: 10
                                        },
                                        isRecommended: {
                                            type: "boolean",
                                            description: "Whether the product is recommended",
                                            example: false
                                        },
                                        isFavorite: {
                                            type: "boolean",
                                            description: "Always true for favorite products",
                                            example: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized - token missing or invalid",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Unauthorized"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Sort must be one of the following values: priceAsc, priceDesc, nameAsc, nameDesc"
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
    "/product/me/favorites/{id}": {
        post: {
            summary: "Add product to favorites",
            description: "Add a specific product to the authenticated user's favorites list.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Idempotent operation - adding an already favorite product succeeds",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Product ID to add to favorites",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                    }
                }
            ],
            responses: {
                "204": {
                    description: "Product successfully added to favorites (or was already in favorites). No content returned."
                },
                "401": {
                    description: "Unauthorized - token missing or invalid",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Unauthorized"
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "Product not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product not found"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product ID must be a valid UUID"
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
        },
        delete: {
            summary: "Remove product from favorites",
            description: "Remove a specific product from the authenticated user's favorites list.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Idempotent operation - removing a non-favorite product succeeds",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Product ID to remove from favorites",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                    }
                }
            ],
            responses: {
                "204": {
                    description: "Product successfully removed from favorites (or was not in favorites). No content returned."
                },
                "401": {
                    description: "Unauthorized - token missing or invalid",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Unauthorized"
                                    }
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "Product not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product not found"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product ID must be a valid UUID"
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
    "/product/favorites/offline": {
        post: {
            summary: "Get offline favorite products",
            description: "Retrieves detailed product information for a list of product IDs from offline favorites.\n\n" +
                "This endpoint is used to get product details for favorites stored offline/locally\n" +
                "without requiring authentication.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Public access without authentication\n\n" +
                "Validation rules:\n" +
                "• Product IDs must be a non-empty array\n" +
                "• Each Product ID must be a valid UUID",
            tags: ["Product"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                productIds: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "uuid",
                                        description: "Product identifier",
                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                    },
                                    minItems: 1,
                                    description: "Array of product IDs to retrieve"
                                }
                            },
                            required: ["productIds"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Favorite products retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Product unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Product name",
                                            example: "Oil Filter"
                                        },
                                        code: {
                                            type: "string",
                                            description: "Product code",
                                            example: "OF-123"
                                        },
                                        manufacturer: {
                                            type: "string",
                                            description: "Product manufacturer",
                                            example: "Bosch"
                                        },
                                        price: {
                                            type: "number",
                                            format: "float",
                                            description: "Current product price",
                                            example: 599.99
                                        },
                                        image: {
                                            type: "array",
                                            items: { type: "string", format: "uri" },
                                            nullable: true,
                                            description: "Array of product image URLs (first item is primary)",
                                            example: ["https://storage.autoshop24.com/products/of-123.jpg"]
                                        },
                                        daysBeforeDelivery: {
                                            type: "integer",
                                            description: "Estimated days before delivery",
                                            example: 3
                                        },
                                        availability: {
                                            type: "string",
                                            enum: ["AVAILABLE", "NOT_AVAILABLE"],
                                            description: "Product availability status",
                                            example: "AVAILABLE"
                                        },
                                        supplier: {
                                            type: "string",
                                            description: "Product supplier",
                                            example: "AutoParts Ltd"
                                        },
                                        isActive: {
                                            type: "boolean",
                                            description: "Product active status",
                                            example: true
                                        },
                                        discount: {
                                            type: "integer",
                                            description: "Product discount percentage",
                                            minimum: 0,
                                            maximum: 100,
                                            example: 0
                                        },
                                        amount: {
                                            type: "integer",
                                            description: "Available stock amount",
                                            minimum: 0,
                                            example: 50
                                        },
                                        isRecommended: {
                                            type: "boolean",
                                            description: "Whether the product is recommended",
                                            example: false
                                        },
                                        isFavorite: {
                                            type: "boolean",
                                            description: "Whether the product is in favorites (always false for offline)",
                                            example: false
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "productIds must be a non-empty array" },
                                            { example: "Each Product ID is required" },
                                            { example: "Each Product ID must be a valid UUID" }
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
    "/product/favorites/offline/set": {
        post: {
            summary: "Merge offline favorites with user's favorites",
            description: "Transfers favorite products from offline storage to user's account after login.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only merge with their own favorites\n\n" +
                "Validation rules:\n" +
                "• Product IDs must be a non-empty array\n" +
                "• Each Product ID must be a valid UUID",
            tags: ["Product"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                productIds: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        format: "uuid",
                                        description: "Product identifier",
                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                    },
                                    minItems: 1,
                                    description: "Array of product IDs to add to favorites"
                                }
                            },
                            required: ["productIds"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Offline favorites merged successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Offline favorite products merged successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized - authentication required",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Unauthorized"
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "productIds must be a non-empty array" },
                                            { example: "Each Product ID is required" },
                                            { example: "Each Product ID must be a valid UUID" }
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
    }
};