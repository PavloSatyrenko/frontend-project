import { Paths } from "swagger-jsdoc";

export const galleryDocs: Paths = {
    "/gallery": {
        get: {
            summary: "Get active gallery pages (Public)",
            description: "Retrieves all active gallery pages. This is a public endpoint accessible without authentication.\n\n" +
                "Response features:\n" +
                "• Returns only active gallery pages (isActive = true)\n" +
                "• Pages are sorted by display order (ascending)\n" +
                "• Includes title, description, and image URLs\n" +
                "• No authentication required",
            tags: ["Gallery"],
            responses: {
                "200": {
                    description: "Gallery pages retrieved successfully",
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
                                            description: "Gallery page unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        title: {
                                            type: "string",
                                            description: "Gallery page title",
                                            maxLength: 255,
                                            example: "Service Center Opening"
                                        },
                                        description: {
                                            type: "string",
                                            description: "Gallery page description",
                                            example: "Our new service center is now open in downtown Kyiv"
                                        },
                                        image: {
                                            type: "string",
                                            format: "uri",
                                            description: "Complete URL of the gallery image",
                                            example: "https://storage.supabase.co/gallery/service-center-opening.jpg"
                                        },
                                        order: {
                                            type: "integer",
                                            description: "Display order of the gallery page",
                                            example: 1
                                        },
                                        isActive: {
                                            type: "boolean",
                                            description: "Whether the gallery page is active",
                                            example: true
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
        },
        post: {
            summary: "Add gallery page",
            description: "Creates a new gallery page with title, description, and image.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Validation rules:\n" +
                "• Title is required (max 255 characters)\n" +
                "• Description is required\n" +
                "• Image key is required (obtained from presigned URL upload)\n" +
                "• All text fields are sanitized for security\n\n" +
                "Note: Use GET /gallery/image-url to get a presigned URL for image upload first, then use the resulting image key in this request.",
            tags: ["Gallery", "Admin"],
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
                                title: {
                                    type: "string",
                                    description: "Gallery page title",
                                    maxLength: 255,
                                    example: "Service Center Opening"
                                },
                                description: {
                                    type: "string",
                                    description: "Gallery page description",
                                    example: "Our new service center is now open in downtown Kyiv"
                                },
                                imageKey: {
                                    type: "string",
                                    description: "Image key from successful upload to presigned URL",
                                    example: "gallery-1696435200000.jpg"
                                }
                            },
                            required: ["title", "description", "imageKey"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Gallery page added successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page added successfully"
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
                                            { example: "Title is required" },
                                            { example: "Title must be a string" },
                                            { example: "Title must be at most 255 characters long" },
                                            { example: "Description is required" },
                                            { example: "Description must be a string" },
                                            { example: "Image Key is required" },
                                            { example: "Image Key must be a string" }
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
    "/gallery/admin": {
        get: {
            summary: "Get all gallery pages (Admin)",
            description: "Retrieves all gallery pages with optional filtering by active status. Admin only endpoint.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Query parameters:\n" +
                "• isActive: Filter by status (ACTIVE | INACTIVE)\n" +
                "• If not provided, returns all pages regardless of status\n\n" +
                "Response features:\n" +
                "• Returns all gallery pages (or filtered by status)\n" +
                "• Pages are sorted by display order (ascending)\n" +
                "• Includes title, description, image URLs, and active status\n" +
                "• Use this endpoint for admin management interface",
            tags: ["Gallery", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "isActive",
                    in: "query",
                    description: "Filter gallery pages by active status",
                    required: false,
                    schema: {
                        type: "string",
                        enum: ["ACTIVE", "INACTIVE"],
                        example: "ACTIVE"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Gallery pages retrieved successfully",
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
                                            description: "Gallery page unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        title: {
                                            type: "string",
                                            description: "Gallery page title",
                                            maxLength: 255,
                                            example: "Service Center Opening"
                                        },
                                        description: {
                                            type: "string",
                                            description: "Gallery page description",
                                            example: "Our new service center is now open in downtown Kyiv"
                                        },
                                        image: {
                                            type: "string",
                                            format: "uri",
                                            description: "Complete URL of the gallery image",
                                            example: "https://storage.supabase.co/gallery/service-center-opening.jpg"
                                        },
                                        order: {
                                            type: "integer",
                                            description: "Display order of the gallery page",
                                            example: 1
                                        },
                                        isActive: {
                                            type: "boolean",
                                            description: "Whether the gallery page is active and visible to public",
                                            example: true
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
                                        example: "isActive must be either ACTIVE or INACTIVE"
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
    "/gallery/image-url": {
        get: {
            summary: "Get presigned URL for image upload",
            description: "Generates a presigned URL for uploading gallery images to cloud storage.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Usage workflow:\n" +
                "1. Call this endpoint to get a presigned URL\n" +
                "2. Upload your image file directly to the returned URL using a PUT request\n" +
                "3. Extract the image key from the URL path\n" +
                "4. Use the image key in POST /gallery or PUT /gallery/{id} requests\n\n" +
                "The presigned URL has limited validity time for security.",
            tags: ["Gallery", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "Presigned URL generated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    url: {
                                        type: "string",
                                        format: "uri",
                                        description: "Presigned URL for image upload",
                                        example: "https://storage.autoshop24.com/gallery/upload?signature=abc123&expires=1696435200"
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
    "/gallery/{id}": {
        put: {
            summary: "Update gallery page",
            description: "Updates an existing gallery page by ID.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Validation rules:\n" +
                "• ID must be a valid UUID\n" +
                "• Title is required (max 255 characters)\n" +
                "• Description is required\n" +
                "• isActive is required (boolean)\n" +
                "• imageKey is optional (only provide when updating image)\n" +
                "• Text fields are sanitized for security\n\n" +
                "Note: To update the image, first upload a new image using GET /gallery/image-url, then provide the new image key.",
            tags: ["Gallery", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Gallery page ID to update",
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
                                title: {
                                    type: "string",
                                    description: "Gallery page title",
                                    maxLength: 255,
                                    example: "Updated Service Center Opening"
                                },
                                description: {
                                    type: "string",
                                    description: "Gallery page description",
                                    example: "Our renovated service center is now open with new equipment"
                                },
                                isActive: {
                                    type: "boolean",
                                    description: "Gallery page active status",
                                    example: true
                                },
                                imageKey: {
                                    type: "string",
                                    description: "New image key from successful upload (optional)",
                                    example: "gallery-1696435300000.jpg"
                                }
                            },
                            required: ["title", "description", "isActive"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Gallery page updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page updated successfully"
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
                "404": {
                    description: "Gallery page not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page not found"
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
                                            { example: "ID is required" },
                                            { example: "ID must be a string" },
                                            { example: "ID must be a valid UUID" },
                                            { example: "Title cannot be empty" },
                                            { example: "Title must be a string" },
                                            { example: "Title must be at most 255 characters long" },
                                            { example: "Description cannot be empty" },
                                            { example: "Description must be a string" },
                                            { example: "Image Key must be a string" },
                                            { example: "isActive cannot be empty" },
                                            { example: "isActive must be a boolean value" }
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
            summary: "Delete gallery page",
            description: "Deletes a gallery page by ID.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Validation rules:\n" +
                "• ID must be a valid UUID\n\n" +
                "Note: This action is irreversible. The gallery page and its associated image will be permanently deleted.",
            tags: ["Gallery", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Gallery page ID to delete",
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
                    description: "Gallery page deleted successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page deleted successfully"
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
                "404": {
                    description: "Gallery page not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page not found"
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
                                            { example: "ID is required" },
                                            { example: "ID must be a string" },
                                            { example: "ID must be a valid UUID" }
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
    "/gallery/{id}/order": {
        put: {
            summary: "Update gallery page order",
            description: "Updates the display order of a gallery page by moving it up or down relative to other pages.\n\n" +
                "Security features:\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Order management:\n" +
                "• Move UP: Decreases order number, moves page towards beginning\n" +
                "• Move DOWN: Increases order number, moves page towards end\n" +
                "• System automatically handles boundary conditions",
            tags: ["Gallery", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: "id",
                    in: "path",
                    description: "Gallery page ID to reorder",
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
                                orderDirection: {
                                    type: "string",
                                    enum: ["UP", "DOWN"],
                                    description: "Direction to move the gallery page",
                                    example: "UP"
                                }
                            },
                            required: ["orderDirection"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Gallery page order updated successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page order updated successfully"
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
                "404": {
                    description: "Gallery page not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Gallery page not found"
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
                                            { example: "ID is required" },
                                            { example: "ID must be a string" },
                                            { example: "ID must be a valid UUID" },
                                            { example: "Order Direction is required" },
                                            { example: "Order Direction must be one of the following values: UP, DOWN" }
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
