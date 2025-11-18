import { Paths } from "swagger-jsdoc";

export const cartDocs: Paths = {
    "/cart": {
        get: {
            summary: "Get user's shopping cart",
            description: "Retrieves the current user's shopping cart with all items and their details.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only access their own cart\n\n" +
                "Response features:\n" +
                "• Full product details for each cart item\n" +
                "• Current prices and availability\n" +
                "• Item quantities and selection status",
            tags: ["Cart"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Shopping cart retrieved successfully",
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
                                            description: "Cart item unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        userId: {
                                            type: "string",
                                            format: "uuid",
                                            description: "User identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        productId: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Product identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        amount: {
                                            type: "integer",
                                            description: "Quantity of the product",
                                            minimum: 1,
                                            example: 1
                                        },
                                        isChecked: {
                                            type: "boolean",
                                            description: "Whether the item is selected",
                                            example: false
                                        },
                                        product: {
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
                                                categoryIds: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                        format: "uuid"
                                                    },
                                                    description: "Array of category identifiers",
                                                    example: ["376e8b09-f32d-4849-bc48-4f69a90a368b", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                                },
                                                isRecommended: {
                                                    type: "boolean",
                                                    description: "Whether the product is recommended",
                                                    example: false
                                                },
                                                isFavorite: {
                                                    type: "boolean",
                                                    description: "Whether the product is in user's favorites",
                                                    example: false
                                                }
                                            }
                                        },
                                        totalPrice: {
                                            type: "number",
                                            format: "float",
                                            description: "Total price for this cart item (amount * price)",
                                            example: 599.99
                                        }
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
        post: {
            summary: "Add product to cart",
            description: "Adds a product to the user's shopping cart.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only modify their own cart\n\n" +
                "Validation rules:\n" +
                "• Product ID must be a valid UUID\n" +
                "• Product cannot be added twice\n" +
                "• Product must exist and be active",
            tags: ["Cart"],
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
                                productId: {
                                    type: "string",
                                    format: "uuid",
                                    description: "ID of the product to add to cart",
                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                }
                            },
                            required: ["productId"]
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "Product successfully added to cart",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product added to cart"
                                    },
                                    cartItem: {
                                        type: "object",
                                        properties: {
                                            id: {
                                                type: "string",
                                                format: "uuid",
                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                            },
                                            userId: {
                                                type: "string",
                                                format: "uuid",
                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                            },
                                            productId: {
                                                type: "string",
                                                format: "uuid",
                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                            },
                                            amount: {
                                                type: "integer",
                                                example: 1
                                            },
                                            isChecked: {
                                                type: "boolean",
                                                example: false
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "400": {
                    description: "Product already in cart",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product already in cart"
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
                                            { example: "Product ID is required" },
                                            { example: "Product ID must be a valid UUID" }
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
    "/cart/multiple": {
        post: {
            summary: "Add multiple products to cart",
            description: "Adds multiple products to the user's shopping cart in a single request.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only modify their own cart\n\n" +
                "Validation rules:\n" +
                "• Product IDs must be a non-empty array\n" +
                "• Each Product ID must be a valid UUID\n" +
                "• Products cannot be added twice\n" +
                "• Products must exist and be active",
            tags: ["Cart"],
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
                                    description: "Array of product IDs to add to cart"
                                }
                            },
                            required: ["productIds"]
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "Products successfully added to cart",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Products added to cart"
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
    },
    "/cart/offline/set": {
        post: {
            summary: "Merge offline cart with user's cart",
            description: "Transfers items from offline cart to user's shopping cart after login.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• User can only merge with their own cart\n\n" +
                "Validation rules:\n" +
                "• Cart items must be an array\n" +
                "• Each item must have a valid UUID product ID\n" +
                "• Amount must be between 1 and 10\n" +
                "• Selection status must be boolean",
            tags: ["Cart"],
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
                                cartItems: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            productId: {
                                                type: "string",
                                                format: "uuid",
                                                description: "Product identifier",
                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                            },
                                            amount: {
                                                type: "integer",
                                                description: "Quantity of the product",
                                                minimum: 1,
                                                maximum: 10,
                                                example: 1
                                            },
                                            isChecked: {
                                                type: "boolean",
                                                description: "Whether the item is selected",
                                                example: true
                                            }
                                        },
                                        required: ["productId", "amount", "isChecked"]
                                    }
                                }
                            },
                            required: ["cartItems"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Offline cart merged successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Offline cart merged successfully"
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
                                            { example: "cartItems must be an array" },
                                            { example: "Product ID is required" },
                                            { example: "Product ID must be a valid UUID" },
                                            { example: "Amount is required" },
                                            { example: "Amount must be an integer between 1 and 10" },
                                            { example: "isChecked is required" },
                                            { example: "isChecked must be a boolean value" }
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
    "/cart/offline": {
        post: {
            summary: "Get offline cart details",
            description: "Retrieves full product information for a list of offline cart items.\n\n" +
                "Validation rules:\n" +
                "• Cart items must be an array\n" +
                "• Each item must have a valid UUID product ID\n" +
                "• Amount must be between 1 and 10\n" +
                "• Selection status must be boolean",
            tags: ["Cart"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                cartItems: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            productId: {
                                                type: "string",
                                                format: "uuid",
                                                description: "Product identifier",
                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                            },
                                            amount: {
                                                type: "integer",
                                                description: "Quantity of the product",
                                                minimum: 1,
                                                maximum: 10,
                                                example: 1
                                            },
                                            isChecked: {
                                                type: "boolean",
                                                description: "Whether the item is selected",
                                                example: true
                                            }
                                        },
                                        required: ["productId", "amount", "isChecked"]
                                    }
                                }
                            },
                            required: ["cartItems"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Cart items retrieved successfully",
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
                                            description: "Cart item identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174001"
                                        },
                                        userId: {
                                            type: "string",
                                            format: "uuid",
                                            nullable: true,
                                            description: "User identifier (null for guest carts)",
                                            example: null
                                        },
                                        productId: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Product identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        amount: {
                                            type: "integer",
                                            description: "Quantity of the product",
                                            minimum: 1,
                                            maximum: 10,
                                            example: 1
                                        },
                                        isChecked: {
                                            type: "boolean",
                                            description: "Whether the item is selected",
                                            example: true
                                        },
                                        totalPrice: {
                                            type: "number",
                                            format: "float",
                                            description: "Total price for this cart item (amount * price)",
                                            example: 599.99
                                        },
                                        product: {
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
                                                categoryIds: {
                                                    type: "array",
                                                    items: {
                                                        type: "string",
                                                        format: "uuid"
                                                    },
                                                    description: "Array of category identifiers",
                                                    example: ["123e4567-e89b-12d3-a456-426614174002", "a7f3c9e1-2b4d-4e8f-9c1a-5d6e7f8a9b0c"]
                                                },
                                                isRecommended: {
                                                    type: "boolean",
                                                    description: "Whether the product is recommended",
                                                    example: false
                                                },
                                                isFavorite: {
                                                    type: "boolean",
                                                    description: "Whether the product is in user's favorites",
                                                    example: false
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
                                                }
                                            }
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
                                            { example: "cartItems must be an array" },
                                            { example: "Product ID is required" },
                                            { example: "Product ID must be a valid UUID" },
                                            { example: "Amount is required" },
                                            { example: "Amount must be an integer between 1 and 10" },
                                            { example: "isChecked is required" },
                                            { example: "isChecked must be a boolean value" }
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
    "/cart/toggle": {
        put: {
            summary: "Toggle all cart items",
            description: "Updates the selection status of all items in the user's shopping cart.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only update their own cart items\n\n" +
                "Validation rules:\n" +
                "• Selection status must be boolean",
            tags: ["Cart"],
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
                                isChecked: {
                                    type: "boolean",
                                    description: "Selection status to apply to all cart items",
                                    example: true
                                }
                            },
                            required: ["isChecked"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Cart items updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Cart items updated"
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
                                            { example: "isChecked is required" },
                                            { example: "isChecked must be a boolean value" }
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
    "/cart/{id}": {
        put: {
            summary: "Update cart item",
            description: "Updates the quantity and selection status of a cart item.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only update their own cart items\n\n" +
                "Validation rules:\n" +
                "• Cart item ID must be a valid UUID\n" +
                "• Amount must be greater than 0\n" +
                "• Selection status must be boolean\n\n" +
                "Stock validation:\n" +
                "• The system checks the available product stock before updating\n" +
                "• If the requested amount exceeds available stock, the request is rejected with a 400 error\n" +
                "• The error message indicates how many items are actually available",
            tags: ["Cart"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Cart item ID to update",
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
                                amount: {
                                    type: "integer",
                                    description: "New quantity for the cart item",
                                    minimum: 1,
                                    example: 2
                                },
                                isChecked: {
                                    type: "boolean",
                                    description: "New selection status",
                                    example: true
                                }
                            },
                            required: ["amount", "isChecked"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Cart item updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Cart item updated"
                                    }
                                }
                            }
                        }
                    }
                },
                "400": {
                    description: "Insufficient stock - requested amount exceeds available stock",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Only 5 items available in stock"
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
                "404": {
                    description: "Cart item not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Cart item not found"
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
                                            { example: "Cart Item ID is required" },
                                            { example: "Cart Item ID must be a valid UUID" },
                                            { example: "Amount is required" },
                                            { example: "Amount must be an integer greater than 0" },
                                            { example: "isChecked is required" },
                                            { example: "isChecked must be a boolean value" }
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
        },
        delete: {
            summary: "Remove item from cart",
            description: "Removes a specific item from the user's shopping cart.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• User can only remove their own cart items\n\n" +
                "Validation rules:\n" +
                "• Cart item ID must be a valid UUID",
            tags: ["Cart"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Cart item ID to remove",
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
                    description: "Cart item removed successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Product removed from cart"
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
                "404": {
                    description: "Cart item not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Cart item not found"
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
                                            { example: "Cart Item ID is required" },
                                            { example: "Cart Item ID must be a valid UUID" }
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
