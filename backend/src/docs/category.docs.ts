import { Paths } from "swagger-jsdoc";

export const categoryDocs: Paths = {
    "/category": {
        get: {
            summary: "Get all categories",
            description: "Retrieves a hierarchical list of all product categories.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Public endpoint - no authentication required\n" +
                "• Cached for performance\n\n" +
                "Response structure:\n" +
                "• Returns hierarchical tree of categories\n" +
                "• Each category has unique ID\n" +
                "• Categories contain nested subcategories array\n" +
                "• Names use Ukrainian collation for sorting\n" +
                "• Optional ?amount parameter limits top categories",
            tags: ["Category"],
            parameters: [
                {
                    name: "amount",
                    in: "query",
                    description: "Limit the number of top-level categories returned",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 1,
                        example: 10
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved categories",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["id", "name", "subcategories"],
                                    properties: {
                                        id: {
                                            type: "string",
                                            format: "uuid",
                                            description: "Category unique identifier",
                                            example: "123e4567-e89b-12d3-a456-426614174000"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Category name with Ukrainian collation",
                                            example: "Фільтри"
                                        },
                                        subcategories: {
                                            type: "array",
                                            description: "Nested subcategories",
                                            items: {
                                                type: "object",
                                                required: ["id", "name", "subcategories"],
                                                properties: {
                                                    id: {
                                                        type: "string",
                                                        format: "uuid",
                                                        description: "Subcategory unique identifier",
                                                        example: "987e4567-e89b-12d3-a456-426614174000"
                                                    },
                                                    name: {
                                                        type: "string",
                                                        description: "Subcategory name with Ukrainian collation",
                                                        example: "Масляні фільтри"
                                                    },
                                                    subcategories: {
                                                        type: "array",
                                                        description: "Nested subcategories",
                                                        items: {
                                                            type: "object",
                                                            required: ["id", "name", "subcategories"],
                                                            properties: {
                                                                id: {
                                                                    type: "string",
                                                                    format: "uuid",
                                                                    description: "Subcategory unique identifier",
                                                                    example: "987e4567-e89b-12d3-a456-426614174000"
                                                                },
                                                                name: {
                                                                    type: "string",
                                                                    description: "Subcategory name with Ukrainian collation",
                                                                    example: "Масляні фільтри"
                                                                },
                                                                subcategories: {
                                                                    type: "array",
                                                                    description: "Further nested subcategories (recursive structure)",
                                                                }
                                                            }
                                                        }
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
    "/category/{id}": {
        get: {
            summary: "Get category hierarchy by ID",
            description: "Retrieves the full category hierarchy from root to the specified category as a nested tree structure.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Public endpoint - no authentication required\n" +
                "• Response is cached\n\n" +
                "Response structure:\n" +
                "• Returns root category with nested subcategories\n" +
                "• Tree structure builds path from root to target category\n" +
                "• Each category contains subcategories array (recursive)\n" +
                "• Target category is the deepest nested element\n" +
                "• Names use Ukrainian collation\n" +
                "• Proper error handling for non-existent IDs",
            tags: ["Category"],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    schema: {
                        type: "string",
                        format: "uuid"
                    },
                    required: true,
                    description: "Unique identifier of the category"
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved the category hierarchy",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                description: "Root category with nested subcategories leading to target",
                                required: ["id", "csvId", "name", "subcategories"],
                                properties: {
                                    id: {
                                        type: "string",
                                        format: "uuid",
                                        description: "Category unique identifier",
                                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                                    },
                                    csvId: {
                                        type: "string",
                                        description: "Category CSV identifier",
                                        example: "CAT001"
                                    },
                                    name: {
                                        type: "string",
                                        description: "Category name with Ukrainian collation",
                                        example: "Автозапчастини"
                                    },
                                    subcategories: {
                                        type: "array",
                                        description: "Nested subcategories leading to target category",
                                        items: {
                                            type: "object",
                                            required: ["id", "csvId", "name", "subcategories"],
                                            properties: {
                                                id: {
                                                    type: "string",
                                                    format: "uuid",
                                                    description: "Subcategory unique identifier"
                                                },
                                                csvId: {
                                                    type: "string",
                                                    description: "Subcategory CSV identifier"
                                                },
                                                name: {
                                                    type: "string",
                                                    description: "Subcategory name"
                                                },
                                                subcategories: {
                                                    type: "array",
                                                    description: "Further nested subcategories (recursive)"
                                                }
                                            }
                                        }
                                    }
                                },
                                example: {
                                    id: "46bf7cd2-fb89-4385-a7cc-7da6facc5613",
                                    csvId: "CAT001",
                                    name: "Автозапчастини",
                                    subcategories: [
                                        {
                                            id: "57cf8de3-gc90-5496-b8dd-8eb7gbdd6724",
                                            csvId: "CAT002",
                                            name: "Двигун",
                                            subcategories: [
                                                {
                                                    id: "68dg9ef4-hd01-6507-c9ee-9fc8hcee7835",
                                                    csvId: "CAT003",
                                                    name: "Поршні",
                                                    subcategories: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                "404": {
                    description: "Category not found",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Category not found"
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
                                            { example: "Category ID is required" },
                                            { example: "Category ID must be a valid UUID" }
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
}