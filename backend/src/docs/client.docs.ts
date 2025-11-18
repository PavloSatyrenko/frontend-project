import { Paths } from "swagger-jsdoc";

export const clientDocs: Paths = {
    "/client": {
        get: {
            summary: "Get list of clients",
            description: "Retrieves a paginated list of clients with optional filtering by role and search. Admin only endpoint.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid admin access token\n" +
                "• All requests are logged\n\n" +
                "Pagination features:\n" +
                "• Page-based pagination (default: page 1, 10 items)\n" +
                "• Configurable page size (max 100 items)\n" +
                "• Total count and pages information\n" +
                "• Clients ordered by number of orders (most active first)\n\n" +
                "Filtering options:\n" +
                "• By role: WHOLESALE, SERVICE_STATION, or RETAIL\n" +
                "• By search: Smart word-based search across name, surname, and phone\n" +
                "• Case-insensitive matching with partial word support\n\n" +
                "Response includes detailed client info with order statistics and pagination metadata.",
            tags: ["Client", "Admin"],
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
                    name: "role",
                    in: "query",
                    description: "Filter clients by role",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["WHOLESALE", "SERVICE_STATION", "RETAIL"],
                        example: "RETAIL"
                    }
                },
                {
                    name: "search",
                    in: "query",
                    description: "Search clients by name, surname, or phone",
                    required: false,
                    schema: {
                        type: "string",
                        example: "John"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved list of clients",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    clients: {
                                        type: "array",
                                        description: "Array of client objects",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "Client's unique identifier",
                                                    example: "550e8400-e29b-41d4-a716-446655440000"
                                                },
                                                name: {
                                                    type: "string",
                                                    description: "Client's first name",
                                                    example: "John"
                                                },
                                                surname: {
                                                    type: "string",
                                                    description: "Client's last name",
                                                    example: "Doe"
                                                },
                                                phone: {
                                                    type: "string",
                                                    description: "Client's phone number",
                                                    example: "+380501234567"
                                                },
                                                role: {
                                                    type: "string",
                                                    enum: ["WHOLESALE", "SERVICE_STATION", "RETAIL", "ADMIN"],
                                                    description: "Client's role",
                                                    example: "RETAIL"
                                                },
                                                discount: {
                                                    type: "integer",
                                                    description: "Client's discount percentage",
                                                    example: 10
                                                },
                                                totalOrders: {
                                                    type: "integer",
                                                    description: "Total number of orders made by the client",
                                                    minimum: 0,
                                                    example: 5
                                                }
                                            }
                                        }
                                    },
                                    totalCount: {
                                        type: "integer",
                                        description: "Total number of clients matching the criteria",
                                        minimum: 0,
                                        example: 150
                                    },
                                    totalPages: {
                                        type: "integer",
                                        description: "Total number of pages available",
                                        minimum: 1,
                                        example: 15
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
                                required: ["clients", "totalCount", "totalPages", "page", "pageSize"]
                            }
                        }
                    }
                },
                "400": {
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
                                            { example: "Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'" },
                                            { example: "Search must be a string" }
                                        ]
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
                "403": {
                    description: "Forbidden - user is not an admin",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Admin role required"
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
    "/client/me": {
        get: {
            summary: "Get personal data",
            description: "Retrieves the authenticated user's personal information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Returns only current user's data\n\n" +
                "Response includes:\n" +
                "• Basic profile information\n" +
                "• Current role and permissions\n" +
                "• Active discount percentage\n" +
                "• Order statistics and history",
            tags: ["Client"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved personal data",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    id: {
                                        type: "string",
                                        format: "uuid",
                                        description: "User's unique identifier",
                                        example: "550e8400-e29b-41d4-a716-446655440000"
                                    },
                                    name: {
                                        type: "string",
                                        description: "User's first name",
                                        example: "John"
                                    },
                                    surname: {
                                        type: "string",
                                        description: "User's last name",
                                        example: "Doe"
                                    },
                                    phone: {
                                        type: "string",
                                        description: "User's phone number",
                                        example: "+380501234567"
                                    },
                                    role: {
                                        type: "string",
                                        enum: ["WHOLESALE", "SERVICE_STATION", "RETAIL", "ADMIN"],
                                        description: "User's role",
                                        example: "RETAIL"
                                    },
                                    email: {
                                        type: "string",
                                        format: "email",
                                        description: "User's email address",
                                        example: "john.doe@example.com",
                                        nullable: true
                                    },
                                    discount: {
                                        type: "integer",
                                        description: "User's discount percentage",
                                        minimum: 0,
                                        maximum: 100,
                                        example: 10
                                    }
                                },
                                required: ["id", "name", "surname", "phone", "role", "discount"]
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
                    description: "User not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "User not found"
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
            summary: "Update personal data",
            description: "Updates the authenticated user's personal information.\n\n" +
                "Validation requirements:\n" +
                "• name: 2-100 characters (required)\n" +
                "• surname: 2-100 characters (required)\n" +
                "• phone: Valid Ukrainian phone number (required)\n" +
                "• email: Valid email address format (optional)\n" +
                "• password: Minimum 6 characters (optional)\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Users can only update their own data\n" +
                "• Password is securely hashed when provided\n\n" +
                "Data handling:\n" +
                "• All text fields are trimmed\n" +
                "• Name and surname are escaped for security\n" +
                "• Phone numbers are validated for UA format\n" +
                "• Email is normalized and validated when provided\n" +
                "• Password is optional for updates",
            tags: ["Client"],
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
                                    description: "User's first name",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "John"
                                },
                                surname: {
                                    type: "string",
                                    description: "User's last name",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "Doe"
                                },
                                phone: {
                                    type: "string",
                                    description: "User's phone number (Ukrainian format)",
                                    example: "0991234567"
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    description: "User's email address (optional)",
                                    example: "john.doe@example.com",
                                    nullable: true
                                },
                                password: {
                                    type: "string",
                                    description: "New password (optional, minimum 6 characters)",
                                    minLength: 6,
                                    example: "newPassword123"
                                }
                            },
                            required: ["name", "surname", "phone"]
                        }
                    }
                }
            },
            responses: {
                "204": {
                    description: "Personal data updated successfully. No content returned."
                },
                "400": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Name is required" },
                                            { example: "Name must be a string" },
                                            { example: "Name must be between 2 and 100 characters" },
                                            { example: "Surname is required" },
                                            { example: "Surname must be a string" },
                                            { example: "Surname must be between 2 and 100 characters" },
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "Please provide a valid email address" },
                                            { example: "Password must be at least 6 characters long" }
                                        ]
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
    "/client/{id}": {
        put: {
            summary: "Update client information",
            description: "Updates a client's information. Only accessible by admin users.\n\n" +
                "Validation requirements:\n" +
                "• id: Valid UUID\n" +
                "• name: 2-100 characters\n" +
                "• surname: 2-100 characters\n" +
                "• phone: Valid Ukrainian phone number\n" +
                "• role: 'WHOLESALE', 'SERVICE_STATION', or 'RETAIL'\n" +
                "• discount: Integer between 0 and 100\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid admin access token\n" +
                "• All updates are logged\n\n" +
                "Data handling:\n" +
                "• All text fields are trimmed\n" +
                "• Name and surname are escaped\n" +
                "• Phone numbers are validated\n" +
                "• Role is checked against enum",
            tags: ["Client", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Client ID to update",
                    required: true,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "550e8400-e29b-41d4-a716-446655440000"
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
                                name: {
                                    type: "string",
                                    description: "Client's first name",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "John"
                                },
                                surname: {
                                    type: "string",
                                    description: "Client's last name",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "Doe"
                                },
                                phone: {
                                    type: "string",
                                    description: "Client's phone number (Ukrainian format)",
                                    example: "+380501234567"
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    description: "Client's email address (optional)",
                                    example: "john.doe@example.com",
                                    nullable: true
                                },
                                role: {
                                    type: "string",
                                    enum: ["WHOLESALE", "SERVICE_STATION", "RETAIL"],
                                    description: "Client's role",
                                    example: "RETAIL"
                                },
                                discount: {
                                    type: "integer",
                                    minimum: 0,
                                    maximum: 100,
                                    description: "Client's discount percentage",
                                    example: 10
                                }
                            },
                            required: ["name", "surname", "phone", "role", "discount"]
                        }
                    }
                }
            },
            responses: {
                "204": {
                    description: "Client information updated successfully"
                },
                "400": {
                    description: "Validation failed",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        oneOf: [
                                            { example: "Client ID must be a valid UUID" },
                                            { example: "Name is required" },
                                            { example: "Name must be a string" },
                                            { example: "Name must be between 2 and 100 characters" },
                                            { example: "Surname is required" },
                                            { example: "Surname must be a string" },
                                            { example: "Surname must be between 2 and 100 characters" },
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "Please provide a valid email address" },
                                            { example: "Role is required" },
                                            { example: "Role must be a string" },
                                            { example: "Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'" },
                                            { example: "Discount is required" },
                                            { example: "Discount must be an integer between 0 and 100" }
                                        ]
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
                "403": {
                    description: "Forbidden - user is not an admin",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Admin role required"
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