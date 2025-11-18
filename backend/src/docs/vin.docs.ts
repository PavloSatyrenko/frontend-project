import { Paths } from "swagger-jsdoc";

export const vinDocs: Paths = {
    "/vin": {
        get: {
            summary: "Get all VIN requests",
            description: "Retrieves all VIN lookup requests.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid access token\n" +
                "• Requires admin role\n\n" +
                "Returns a list of VIN requests with customer details and status.",
            tags: ["VIN", "Admin"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                "200": {
                    description: "List of VIN requests retrieved successfully",
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
                                            description: "VIN request unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Customer name",
                                            example: "John Doe"
                                        },
                                        phone: {
                                            type: "string",
                                            description: "Customer phone number",
                                            example: "+380501234567"
                                        },
                                        vin: {
                                            type: "string",
                                            description: "Vehicle Identification Number",
                                            example: "1HGCM82633A123456"
                                        },
                                        text: {
                                            type: "string",
                                            nullable: true,
                                            description: "Additional request details",
                                            example: "Need parts for front suspension"
                                        },
                                        createdAt: {
                                            type: "string",
                                            format: "date-time",
                                            description: "Request creation timestamp",
                                            example: "2025-09-25T10:30:00Z"
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
            summary: "Submit a VIN lookup request",
            description: "Submits a new VIN lookup request for parts information.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Validation rules:\n" +
                "• Name must be between 2 and 100 characters\n" +
                "• Phone must be a valid Ukrainian mobile number\n" +
                "• VIN must be exactly 17 characters\n" +
                "• Additional text limited to 2000 characters",
            tags: ["VIN"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "Customer name",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "John Doe"
                                },
                                phone: {
                                    type: "string",
                                    description: "Customer phone number (Ukrainian format)",
                                    example: "+380501234567"
                                },
                                vin: {
                                    type: "string",
                                    description: "Vehicle Identification Number",
                                    minLength: 17,
                                    maxLength: 17,
                                    example: "1HGCM82633A123456"
                                },
                                text: {
                                    type: "string",
                                    description: "Additional request details",
                                    maxLength: 2000,
                                    example: "Need parts for front suspension"
                                }
                            },
                            required: ["name", "phone", "vin"]
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "VIN request submitted successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Request sent successfully"
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
                                            { example: "Name is required" },
                                            { example: "Name must be a string" },
                                            { example: "Name must be between 2 and 100 characters" },
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "VIN is required" },
                                            { example: "VIN must be a string" },
                                            { example: "VIN must be exactly 17 characters" },
                                            { example: "Text must be a string" },
                                            { example: "Text cannot exceed 300 characters" }
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
