import { Paths } from "swagger-jsdoc";

export const orderDocs: Paths = {
    "/order": {
        get: {
            summary: "Get orders list",
            description: "Retrieves a list of all orders in the system. Admin only endpoint.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Requires admin access\n\n" +
                "Filtering options:\n" +
                "• Period: Last month, 6 months, or year\n" +
                "• Status: ACCEPTED, PROCESSING, PREPARING, SENT, COMPLETED, CANCELLED\n" +
                "• Search: By order number (partial match)\n\n" +
                "Response features:\n" +
                "• Orders are sorted by date (newest first)\n" +
                "• Includes order status and timestamps\n" +
                "• Order numbers are unique and sequential\n" +
                "• All times are in UTC timezone",
            tags: ["Order", "Admin"],
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
                    description: "Number of items per page (1-100)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                        example: 10
                    }
                },
                {
                    name: "period",
                    in: "query",
                    description: "Filter orders by period (last month, last 6 months, or last year)",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["MONTH", "HALF_YEAR", "YEAR"],
                        example: "MONTH"
                    }
                },
                {
                    name: "status",
                    in: "query",
                    description: "Filter orders by status",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"],
                        example: "ACCEPTED"
                    }
                },
                {
                    name: "search",
                    in: "query",
                    description: "Search orders by number",
                    required: false,
                    schema: {
                        type: "integer",
                        example: 123
                    }
                }
            ],
            responses: {
                "200": {
                    description: "List of orders retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    orders: {
                                        type: "array",
                                        description: "Array of order objects",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                number: {
                                                    type: "number",
                                                    example: 12345
                                                },
                                                date: {
                                                    type: "string",
                                                    format: "date-time",
                                                    example: "2025-09-21T12:00:00Z"
                                                },
                                                status: {
                                                    type: "string",
                                                    enum: ["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"],
                                                    example: "ACCEPTED"
                                                },
                                                userId: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                name: {
                                                    type: "string",
                                                    example: "John"
                                                },
                                                surname: {
                                                    type: "string",
                                                    example: "Doe"
                                                },
                                                phone: {
                                                    type: "string",
                                                    example: "+380501234567"
                                                },
                                                email: {
                                                    type: "string",
                                                    format: "email",
                                                    nullable: true,
                                                    example: "john.doe@example.com"
                                                },
                                                invoice: {
                                                    type: "string",
                                                    nullable: true,
                                                    description: "Invoice number",
                                                    example: "INV-2025-001"
                                                },
                                                productsPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total price of all products (after markup and discounts)",
                                                    example: 299.99
                                                },
                                                productsAmount: {
                                                    type: "integer",
                                                    description: "Total quantity of all products in the order",
                                                    example: 5
                                                },
                                                deliveryMethod: {
                                                    type: "string",
                                                    enum: ["PICKUP", "COURIER", "PARCEL_LOCKER", "POST_OFFICE"],
                                                    example: "PICKUP"
                                                },
                                                paymentMethod: {
                                                    type: "string",
                                                    enum: ["MANAGER_ONLINE", "PAYMENT_ON_PICKUP", "CASH_ON_DELIVERY"],
                                                    example: "MANAGER_ONLINE",
                                                    description: "Payment method chosen by the customer"
                                                },
                                                deliveryPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    example: 15.00
                                                },
                                                totalPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total order price (productsPrice + deliveryPrice)",
                                                    example: 314.99
                                                },
                                                orderItems: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            price: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Base product price (without markup or discount)",
                                                                example: 89.99
                                                            },
                                                            priceOutBasic: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Price with user role markup (before discount)",
                                                                example: 99.99
                                                            },
                                                            priceOut: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Final price (with markup and discount applied)",
                                                                example: 94.99
                                                            },
                                                            amount: {
                                                                type: "number",
                                                                example: 2
                                                            },
                                                            product: {
                                                                type: "object",
                                                                properties: {
                                                                    id: {
                                                                        type: "string",
                                                                        format: "uuid",
                                                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                                                    },
                                                                    name: {
                                                                        type: "string",
                                                                        example: "Brake Pad Set"
                                                                    },
                                                                    code: {
                                                                        type: "string",
                                                                        example: "BP-12345"
                                                                    },
                                                                    manufacturer: {
                                                                        type: "string",
                                                                        example: "Bosch"
                                                                    },
                                                                    price: {
                                                                        type: "number",
                                                                        format: "float",
                                                                        example: 99.99
                                                                    },
                                                                    image: {
                                                                        type: "array",
                                                                        items: { type: "string", format: "uri" },
                                                                        nullable: true,
                                                                        example: ["https://example.com/product.jpg"]
                                                                    },
                                                                    daysBeforeDelivery: {
                                                                        type: "integer",
                                                                        example: 3
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
                                                                        example: ["376e8b09-f32d-4849-bc48-4f69a90a368b"]
                                                                    },
                                                                    supplier: {
                                                                        type: "string",
                                                                        example: "AutoParts Ltd"
                                                                    },
                                                                    isActive: {
                                                                        type: "boolean",
                                                                        example: true
                                                                    },
                                                                    discount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        maximum: 100,
                                                                        example: 0
                                                                    },
                                                                    amount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        example: 50
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
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: "integer",
                                        description: "Total number of orders matching the criteria",
                                        minimum: 0,
                                        example: 25
                                    },
                                    totalPages: {
                                        type: "integer",
                                        description: "Total number of pages available",
                                        minimum: 1,
                                        example: 3
                                    },
                                    page: {
                                        type: "integer",
                                        description: "Current page number",
                                        minimum: 1,
                                        example: 1
                                    },
                                    pageSize: {
                                        type: "integer",
                                        description: "Number of items per page",
                                        minimum: 1,
                                        maximum: 100,
                                        example: 10
                                    }
                                },
                                required: ["orders", "totalCount", "totalPages", "page", "pageSize"]
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized - authentication required"
                },
                "403": {
                    description: "Forbidden - admin access required"
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
                                        description: "Validation error message(s)",
                                        oneOf: [
                                            { example: "Page must be a positive integer" },
                                            { example: "Page size must be a positive integer between 1 and 100" },
                                            { example: "Period must be one of the following values: MONTH, HALF_YEAR, YEAR" },
                                            { example: "Status must be one of the following values: ACCEPTED, PROCESSING, PREPARING, SENT, COMPLETED, CANCELLED" },
                                            { example: "Search must be a number" }
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
        post: {
            summary: "Create new order",
            description: "Creates a new order with optional authentication.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Optional authentication via optionalAuthMiddleware\n\n" +
                "Authentication modes:\n" +
                "• With authentication: Uses user data from token\n" +
                "• Without authentication: Requires customer details in request body (guest checkout)\n\n" +
                "Behavior and side-effects:\n" +
                "• The service will try to map the request to an existing user by `userId` (when authenticated) or by phone number.\n" +
                "• If a user with the provided phone exists, the server will update name/surname/email for that user.\n" +
                "• If no matching user is found, a guest user is created (role: WHOLESALE, isRegistered: false).\n" +
                "• The order is persisted to the database. After persisting, the server removes matching items from the user's cart.\n" +
                "• After the order is created the server also issues a non-blocking GET request to the configured AUTOSELLING endpoint with the created order id appended (GET {AUTOSELLING_ORDER_URL}{orderId}) and a Content-Type: application/json header. This external request is fire-and-forget and is not awaited; failures from that call do not change the HTTP response returned to the client.\n\n" +
                "Notes on atomicity and reliability:\n" +
                "• Order persistence and cart removal are separate steps in the current implementation and are not wrapped in a single explicit transaction. If you need full atomicity across external calls, consider using an outbox pattern, background worker, or compensating transactions.\n\n" +
                "Validation rules:\n" +
                "• Phone number required for guest orders only (Ukrainian format)\n" +
                "• Name and surname required for guest orders only (2-100 characters each)\n" +
                "• Email optional for guest orders\n" +
                "• Delivery method is required (PICKUP, COURIER, PARCEL_LOCKER, POST_OFFICE)\n" +
                "• Delivery price is required (non-negative number)\n" +
                "• Order items are required (non-empty array with valid product IDs and amounts)",
            tags: ["Order"],
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
                                name: {
                                    type: "string",
                                    description: "Customer name (required for guest orders only)",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "John"
                                },
                                surname: {
                                    type: "string",
                                    description: "Customer surname (required for guest orders only)",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "Doe"
                                },
                                phone: {
                                    type: "string",
                                    description: "Customer phone number (required for guest orders only, Ukrainian format)",
                                    example: "+380501234567"
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    description: "Customer email (optional for guest orders)",
                                    example: "john.doe@example.com"
                                },
                                invoice: {
                                    type: "string",
                                    description: "Invoice number (optional)",
                                    example: "INV-2025-001"
                                },
                                deliveryMethod: {
                                    type: "string",
                                    enum: ["PICKUP", "COURIER", "PARCEL_LOCKER", "POST_OFFICE"],
                                    description: "Delivery method",
                                    example: "PICKUP"
                                },
                                paymentMethod: {
                                    type: "string",
                                    enum: ["MANAGER_ONLINE", "PAYMENT_ON_PICKUP", "CASH_ON_DELIVERY"],
                                    description: "Payment method chosen by the customer",
                                    example: "PAYMENT_ON_PICKUP"
                                },
                                deliveryPrice: {
                                    type: "number",
                                    format: "float",
                                    description: "Delivery price",
                                    minimum: 0,
                                    example: 50.00
                                },
                                orderItems: {
                                    type: "array",
                                    description: "Array of order items",
                                    minItems: 1,
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
                                                description: "Product quantity",
                                                minimum: 1,
                                                example: 2
                                            }
                                        },
                                        required: ["productId", "amount"]
                                    }
                                }
                            },
                            required: ["deliveryMethod", "deliveryPrice", "orderItems", "paymentMethod"]
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "Order created successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Order created successfully"
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
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "Name is required" },
                                            { example: "Name must be a string" },
                                            { example: "Name must be between 2 and 100 characters" },
                                            { example: "Surname is required" },
                                            { example: "Surname must be a string" },
                                            { example: "Surname must be between 2 and 100 characters" },
                                            { example: "Email is required" },
                                            { example: "Please provide a valid email address" },
                                            { example: "Invoice must be a string" },
                                            { example: "Delivery method is required" },
                                            { example: "Delivery method must be either PICKUP, COURIER, PARCEL_LOCKER or POST_OFFICE" },
                                            { example: "Delivery price is required" },
                                            { example: "Delivery price must be a non-negative number" },
                                            { example: "Order items are required" },
                                            { example: "Order items must be an array" },
                                            { example: "Product ID is required" },
                                            { example: "Product ID must be a valid UUID" },
                                            { example: "Amount is required" },
                                            { example: "Amount must be a positive integer" }
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
    "/order/me": {
        get: {
            summary: "Get authenticated user's orders",
            description: "Retrieves a list of orders for the authenticated user.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n\n" +
                "Filtering options:\n" +
                "• Period: Last month, 6 months, or year\n" +
                "• Search: By order number (partial match)\n\n" +
                "Response features:\n" +
                "• Orders are sorted by date (newest first)\n" +
                "• Includes order status and timestamps\n" +
                "• Order numbers are unique and sequential\n" +
                "• All times are in UTC timezone\n" +
                "• Returns paginated results with metadata",
            tags: ["Order"],
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
                    description: "Number of items per page (1-100)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                        example: 10
                    }
                },
                {
                    name: "period",
                    in: "query",
                    description: "Filter orders by period (last month, last 6 months, or last year)",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["MONTH", "HALF_YEAR", "YEAR"],
                        example: "MONTH"
                    }
                },
                {
                    name: "search",
                    in: "query",
                    description: "Search orders by number",
                    required: false,
                    schema: {
                        type: "integer",
                        example: 123
                    }
                }
            ],
            responses: {
                "200": {
                    description: "User's orders retrieved successfully with pagination",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    orders: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                number: {
                                                    type: "number",
                                                    example: 12345
                                                },
                                                date: {
                                                    type: "string",
                                                    format: "date-time",
                                                    example: "2025-09-21T12:00:00Z"
                                                },
                                                status: {
                                                    type: "string",
                                                    enum: ["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"],
                                                    example: "ACCEPTED"
                                                },
                                                userId: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                name: {
                                                    type: "string",
                                                    example: "John"
                                                },
                                                surname: {
                                                    type: "string",
                                                    example: "Doe"
                                                },
                                                phone: {
                                                    type: "string",
                                                    example: "+380501234567"
                                                },
                                                email: {
                                                    type: "string",
                                                    format: "email",
                                                    nullable: true,
                                                    example: "john.doe@example.com"
                                                },
                                                invoice: {
                                                    type: "string",
                                                    nullable: true,
                                                    description: "Invoice number",
                                                    example: "INV-2025-001"
                                                },
                                                productsPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total price of all products (after markup and discounts)",
                                                    example: 299.99
                                                },
                                                productsAmount: {
                                                    type: "integer",
                                                    description: "Total quantity of all products in the order",
                                                    example: 5
                                                },
                                                deliveryMethod: {
                                                    type: "string",
                                                    example: "Express"
                                                },
                                                paymentMethod: {
                                                    type: "string",
                                                    enum: ["MANAGER_ONLINE", "PAYMENT_ON_PICKUP", "CASH_ON_DELIVERY"],
                                                    description: "Payment method chosen by the customer",
                                                    example: "CASH_ON_DELIVERY"
                                                },
                                                deliveryPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    example: 15.00
                                                },
                                                totalPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total order price (productsPrice + deliveryPrice)",
                                                    example: 314.99
                                                },
                                                orderItems: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            price: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Base product price (without markup or discount)",
                                                                example: 89.99
                                                            },
                                                            priceOutBasic: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Price with user role markup (before discount)",
                                                                example: 99.99
                                                            },
                                                            priceOut: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Final price (with markup and discount applied)",
                                                                example: 94.99
                                                            },
                                                            amount: {
                                                                type: "number",
                                                                example: 2
                                                            },
                                                            product: {
                                                                type: "object",
                                                                properties: {
                                                                    id: {
                                                                        type: "string",
                                                                        format: "uuid",
                                                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                                                    },
                                                                    name: {
                                                                        type: "string",
                                                                        example: "Brake Pad Set"
                                                                    },
                                                                    code: {
                                                                        type: "string",
                                                                        example: "BP-12345"
                                                                    },
                                                                    manufacturer: {
                                                                        type: "string",
                                                                        example: "Bosch"
                                                                    },
                                                                    price: {
                                                                        type: "number",
                                                                        format: "float",
                                                                        example: 99.99
                                                                    },
                                                                    image: {
                                                                        type: "array",
                                                                        items: { type: "string", format: "uri" },
                                                                        nullable: true,
                                                                        example: ["https://example.com/product.jpg"]
                                                                    },
                                                                    daysBeforeDelivery: {
                                                                        type: "integer",
                                                                        example: 3
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
                                                                        example: ["376e8b09-f32d-4849-bc48-4f69a90a368b"]
                                                                    },
                                                                    supplier: {
                                                                        type: "string",
                                                                        example: "AutoParts Ltd"
                                                                    },
                                                                    isActive: {
                                                                        type: "boolean",
                                                                        example: true
                                                                    },
                                                                    discount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        maximum: 100,
                                                                        example: 0
                                                                    },
                                                                    amount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        example: 50
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
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: "integer",
                                        minimum: 0,
                                        example: 25
                                    },
                                    totalPages: {
                                        type: "integer",
                                        minimum: 1,
                                        example: 3
                                    },
                                    page: {
                                        type: "integer",
                                        minimum: 1,
                                        example: 1
                                    },
                                    pageSize: {
                                        type: "integer",
                                        minimum: 1,
                                        maximum: 100,
                                        example: 10
                                    }
                                },
                                required: ["orders", "totalCount", "totalPages", "page", "pageSize"]
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
                                        description: "Validation error message(s)",
                                        oneOf: [
                                            { example: "Page must be a positive integer" },
                                            { example: "Page size must be a positive integer between 1 and 100" },
                                            { example: "Period must be one of the following values: MONTH, HALF_YEAR, YEAR" },
                                            { example: "Search must be a number" }
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
    "/order/user/{userId}": {
        get: {
            summary: "Get user's orders (Admin only)",
            description: "Retrieves all orders for a specific user by their ID.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n\n" +
                "Response features:\n" +
                "• Returns all orders for the specified user\n" +
                "• Orders are sorted by date (newest first)\n" +
                "• Includes order status and timestamps\n" +
                "• Order numbers are unique and sequential\n" +
                "• All times are in UTC timezone",
            tags: ["Order", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "userId",
                    in: "path",
                    description: "ID of the user whose orders to retrieve",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "123e4567-e89b-12d3-a456-426614174000"
                    }
                },
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
                    description: "Number of items per page (1-100)",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                        example: 10
                    }
                }
            ],
            responses: {
                "200": {
                    description: "List of user's orders retrieved successfully with pagination",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    orders: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                number: {
                                                    type: "number",
                                                    example: 12345
                                                },
                                                date: {
                                                    type: "string",
                                                    format: "date-time",
                                                    example: "2025-09-21T12:00:00Z"
                                                },
                                                status: {
                                                    type: "string",
                                                    enum: ["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"],
                                                    example: "ACCEPTED"
                                                },
                                                userId: {
                                                    type: "string",
                                                    format: "uuid",
                                                    example: "123e4567-e89b-12d3-a456-426614174000"
                                                },
                                                name: {
                                                    type: "string",
                                                    example: "John"
                                                },
                                                surname: {
                                                    type: "string",
                                                    example: "Doe"
                                                },
                                                phone: {
                                                    type: "string",
                                                    example: "+380501234567"
                                                },
                                                email: {
                                                    type: "string",
                                                    format: "email",
                                                    nullable: true,
                                                    example: "john.doe@example.com"
                                                },
                                                invoice: {
                                                    type: "string",
                                                    nullable: true,
                                                    description: "Invoice number",
                                                    example: "INV-2025-001"
                                                },
                                                productsPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total price of all products (after markup and discounts)",
                                                    example: 299.99
                                                },
                                                productsAmount: {
                                                    type: "integer",
                                                    description: "Total quantity of all products in the order",
                                                    example: 5
                                                },
                                                deliveryMethod: {
                                                    type: "string",
                                                    example: "Express"
                                                },
                                                paymentMethod: {
                                                    type: "string",
                                                    enum: ["MANAGER_ONLINE", "PAYMENT_ON_PICKUP", "CASH_ON_DELIVERY"],
                                                    description: "Payment method chosen by the customer",
                                                    example: "MANAGER_ONLINE"
                                                },
                                                deliveryPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    example: 15.00
                                                },
                                                totalPrice: {
                                                    type: "number",
                                                    format: "float",
                                                    description: "Total order price (productsPrice + deliveryPrice)",
                                                    example: 314.99
                                                },
                                                orderItems: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            id: {
                                                                type: "string",
                                                                format: "uuid",
                                                                example: "123e4567-e89b-12d3-a456-426614174000"
                                                            },
                                                            price: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Base product price (without markup or discount)",
                                                                example: 89.99
                                                            },
                                                            priceOutBasic: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Price with user role markup (before discount)",
                                                                example: 99.99
                                                            },
                                                            priceOut: {
                                                                type: "number",
                                                                format: "float",
                                                                description: "Final price (with markup and discount applied)",
                                                                example: 94.99
                                                            },
                                                            amount: {
                                                                type: "number",
                                                                example: 2
                                                            },
                                                            product: {
                                                                type: "object",
                                                                properties: {
                                                                    id: {
                                                                        type: "string",
                                                                        format: "uuid",
                                                                        example: "123e4567-e89b-12d3-a456-426614174000"
                                                                    },
                                                                    name: {
                                                                        type: "string",
                                                                        example: "Brake Pad Set"
                                                                    },
                                                                    code: {
                                                                        type: "string",
                                                                        example: "BP-12345"
                                                                    },
                                                                    manufacturer: {
                                                                        type: "string",
                                                                        example: "Bosch"
                                                                    },
                                                                    price: {
                                                                        type: "number",
                                                                        format: "float",
                                                                        example: 99.99
                                                                    },
                                                                    image: {
                                                                        type: "array",
                                                                        items: { type: "string", format: "uri" },
                                                                        nullable: true,
                                                                        example: ["https://example.com/product.jpg"]
                                                                    },
                                                                    daysBeforeDelivery: {
                                                                        type: "integer",
                                                                        example: 3
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
                                                                        example: ["376e8b09-f32d-4849-bc48-4f69a90a368b"]
                                                                    },
                                                                    supplier: {
                                                                        type: "string",
                                                                        example: "AutoParts Ltd"
                                                                    },
                                                                    isActive: {
                                                                        type: "boolean",
                                                                        example: true
                                                                    },
                                                                    discount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        maximum: 100,
                                                                        example: 0
                                                                    },
                                                                    amount: {
                                                                        type: "integer",
                                                                        minimum: 0,
                                                                        example: 50
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
                                            }
                                        },
                                        totalCount: {
                                            type: "integer",
                                            description: "Total number of orders for this user",
                                            minimum: 0,
                                            example: 25
                                        },
                                        totalPages: {
                                            type: "integer",
                                            description: "Total number of pages available",
                                            minimum: 1,
                                            example: 3
                                        },
                                        page: {
                                            type: "integer",
                                            description: "Current page number",
                                            minimum: 1,
                                            example: 1
                                        },
                                        pageSize: {
                                            type: "integer",
                                            description: "Number of items per page",
                                            minimum: 1,
                                            maximum: 100,
                                            example: 10
                                        }
                                    },
                                    required: ["orders", "totalCount", "totalPages", "page", "pageSize"]
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
                                                { example: "Page must be a positive integer" },
                                                { example: "Page size must be a positive integer between 1 and 100" },
                                                { example: "User ID is required" },
                                                { example: "User ID must be a string" },
                                                { example: "User ID must be a valid UUID" }
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
        "/order/{orderNumber}/info": {
            get: {
                summary: "Get order info (integrator format)",
                description: "Returns a compact order representation intended for external integrators and systems.\n\n" +
                    "Security features:\n" +
                    "• Rate limited to 300 requests per 10 minutes\n" +
                    "• No authentication required (public endpoint)\n\n" +
                    "This endpoint returns buyer contact information and a list of ordered items with supplier and pricing details. It does not expose internal metadata such as timestamps or internal status codes.",
                tags: ["Order"],
                parameters: [
                    {
                        name: "orderNumber",
                        in: "path",
                        description: "Order number to retrieve",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 0,
                            example: 12345
                        }
                    }
                ],
                responses: {
                    "200": {
                        description: "Order information retrieved successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        order_id: {
                                            type: "integer",
                                            description: "Order number",
                                            example: 12345
                                        },
                                        order_total: {
                                            type: "number",
                                            format: "float",
                                            example: 314.99
                                        },
                                        delivery_name: {
                                            type: "string",
                                            description: "Delivery method name",
                                            example: "PICKUP"
                                        },
                                        delivery_type: {
                                            type: "integer",
                                            description: "Delivery type code",
                                            example: 1
                                        },
                                        user_lastname: {
                                            type: "string",
                                            example: "Doe"
                                        },
                                        user_firstname: {
                                            type: "string",
                                            example: "John"
                                        },
                                        user_telephone: {
                                            type: "string",
                                            example: "+380501234567"
                                        },
                                        ordered_items: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    name: {
                                                        type: "string",
                                                        example: "Brake Pad"
                                                    },
                                                    brand: {
                                                        type: "string",
                                                        example: "Acme"
                                                    },
                                                    articul: {
                                                        type: "string",
                                                        example: "BP-1234"
                                                    },
                                                    quantity: {
                                                        type: "integer",
                                                        example: 2
                                                    },
                                                    price_in: {
                                                        type: "number",
                                                        format: "float",
                                                        description: "Base product price (without markup or discount)",
                                                        example: 89.99
                                                    },
                                                    price_out_basic: {
                                                        type: "number",
                                                        format: "float",
                                                        description: "Price with user role markup (before discount)",
                                                        example: 99.99
                                                    },
                                                    price_out: {
                                                        type: "number",
                                                        format: "float",
                                                        description: "Final price (with markup and discount applied)",
                                                        example: 94.99
                                                    },
                                                    supplier: {
                                                        type: "string",
                                                        example: "Distributor Ltd."
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    required: ["order_id", "order_total", "delivery_name", "delivery_type", "user_lastname", "user_firstname", "user_telephone", "ordered_items"]
                                }
                            }
                        }
                    },
                    "404": {
                        description: "Order not found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: {
                                            type: "string",
                                            example: "Order not found"
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
                                                {
                                                    example: "Order number is required"
                                                },
                                                {
                                                    example: "Order number must be a non-negative integer"
                                                }
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
    },
    "/order/{orderId}/status": {
        put: {
            summary: "Update order status",
            description: "Updates the status of an existing order. Admin only endpoint.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Requires admin access\n\n" +
                "Order status management:\n" +
                "• ACCEPTED: Order has been accepted\n" +
                "• PROCESSING: Order is being processed\n" +
                "• PREPARING: Order is being prepared for delivery\n" +
                "• SENT: Order has been sent\n" +
                "• COMPLETED: Order has been completed\n" +
                "• CANCELLED: Order has been cancelled\n\n" +
                "Notes:\n" +
                "• Status transitions should follow business logic\n" +
                "• Order ID must be a valid UUID\n" +
                "• Status change is immediately reflected in the database",
            tags: ["Order", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "orderId",
                    in: "path",
                    description: "Order ID to update",
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
                                status: {
                                    type: "string",
                                    enum: ["ACCEPTED", "PROCESSING", "PREPARING", "SENT", "COMPLETED", "CANCELLED"],
                                    description: "New order status",
                                    example: "COMPLETED"
                                }
                            },
                            required: ["status"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Order status updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Order status updated successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized - authentication required"
                },
                "403": {
                    description: "Forbidden - admin access required"
                },
                "404": {
                    description: "Order not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Order not found"
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
                                            { example: "Order ID is required" },
                                            { example: "Order ID must be a valid UUID" },
                                            { example: "Status is required" },
                                            { example: "Status must be one of the following values: ACCEPTED, PROCESSING, PREPARING, SENT, COMPLETED, CANCELLED" }
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