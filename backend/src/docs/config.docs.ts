
import { Paths } from "swagger-jsdoc";

export const configDocs: Paths = {
    "/config": {
        get: {
            summary: "Get all configuration values",
            description: "Retrieves all configuration key-value pairs from the system.\n\n" +
                "Security features:\n" +
                "• Public endpoint - no authentication required\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Response structure:\n" +
                "• Returns array of configuration objects\n" +
                "• Each object contains key and value properties\n" +
                "• Used for dynamic system configuration",
            tags: ["Config"],
            responses: {
                "200": {
                    description: "Successfully retrieved configuration values",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["key", "value", "group"],
                                    properties: {
                                        key: {
                                            type: "string",
                                            description: "Configuration key identifier",
                                            example: "SITE_NAME"
                                        },
                                        value: {
                                            type: "string",
                                            description: "Configuration value",
                                            example: "AutoShop24"
                                        },
                                        group: {
                                            type: "string",
                                            description: "Configuration group or namespace",
                                            example: "GENERAL"
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
        put: {
            summary: "Set or update a configuration value",
            description: "Creates a new configuration value or updates an existing one.\n\n" +
                "Security features:\n" +
                "• Admin only endpoint\n" +
                "• Rate limited to 300 requests per 10 minutes\n\n" +
                "Operation:\n" +
                "• Uses upsert operation (create if not exists, update if exists)\n" +
                "• Key must be unique\n" +
                "• Both key and value are required strings",
            tags: ["Config"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["key", "value", "group"],
                            properties: {
                                key: {
                                    type: "string",
                                    description: "Configuration key identifier",
                                    example: "SITE_NAME"
                                },
                                value: {
                                    type: "string",
                                    description: "Configuration value to set",
                                    example: "AutoShop24"
                                },
                                group: {
                                    type: "string",
                                    description: "Configuration group or namespace",
                                    example: "GENERAL"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Config value set successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Config value set successfully"
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
                                            { example: "Key is required" },
                                            { example: "Value is required" },
                                            { example: "Group is required" },
                                            { example: "Key must be a string" },
                                            { example: "Value must be a string" },
                                            { example: "Group must be a string" }
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