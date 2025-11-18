import { Paths } from "swagger-jsdoc";

export const filterDocs: Paths = {
    "/filter": {
        get: {
            summary: "Get dynamic product filters with cross-filtering support",
            description: "Returns dynamically generated filters based on available products with intelligent cross-filtering.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Public endpoint - no authentication required\n" +
                "• Response is cached for performance\n\n" +
                "Cross-filtering logic:\n" +
                "• Виробники filter excludes selected manufacturers but includes selected subcategories and other filters\n" +
                "• Підкатегорії filter excludes selected subcategories but includes selected manufacturers and other filters\n" +
                "• This allows users to see alternative options while maintaining other selections\n" +
                "• Selected filters are ALWAYS included even if no products match current criteria\n\n" +
                "Search functionality:\n" +
                "• Multi-word queries (space-separated) with AND logic - all words must match\n" +
                "• Matches product name: startsWith, contains with space/slash/dash prefix\n" +
                "• Matches manufacturer: startsWith, contains with space prefix\n" +
                "• Matches product code: contains anywhere\n" +
                "• Case-insensitive matching\n" +
                "• Minimum 4 characters for search to activate (filters non-empty names otherwise)\n\n" +
                "Category hierarchy:\n" +
                "• subcategoryIds: filters by specific subcategories + all their descendants recursively\n" +
                "• categoryId: filters by category + all descendants, shows direct children in Підкатегорії filter\n" +
                "• Підкатегорії shows only direct children that have products (in themselves or descendants)\n\n" +
                "Available filters:\n" +
                "• Виробники (id: '1') - shown if any manufacturers exist, sorted alphabetically\n" +
                "• Підкатегорії (id: '2') - shown when categoryId provided and direct children with products exist\n" +
                "• Знижки (id: '3') - always included with values 'Зі знижкою' and 'Без знижки'\n\n" +
                "Filter persistence:\n" +
                "• Selected manufacturers are always included in response\n" +
                "• Selected subcategories are always included in response\n" +
                "• This ensures UI can display selected filters even when no products match",
            tags: ["Filter"],
            parameters: [
                {
                    name: "categoryId",
                    in: "query",
                    description: "Root category UUID to filter by. Includes this category + all descendants recursively in product filtering. Also enables Підкатегорії filter showing direct children. Mutually used with subcategoryIds (subcategoryIds takes precedence).",
                    required: false,
                    schema: {
                        type: "string",
                        format: "uuid",
                        example: "46bf7cd2-fb89-4385-a7cc-7da6facc5613"
                    }
                },
                {
                    name: "subcategoryIds",
                    in: "query",
                    description: "Array of subcategory UUIDs currently selected. Each subcategory includes all its descendants recursively. Takes precedence over categoryId for product filtering. These values are guaranteed to appear in Підкатегорії filter response.",
                    required: false,
                    schema: {
                        type: "array",
                        items: {
                            type: "string",
                            format: "uuid"
                        },
                        example: ["abc123-uuid", "def456-uuid"]
                    }
                },
                {
                    name: "manufacturers",
                    in: "query",
                    description: "Array of manufacturer names currently selected. Excluded from Виробники filter calculation but guaranteed to appear in response. Used in Підкатегорії filter calculation.",
                    required: false,
                    schema: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        example: ["Bosch", "Mann"]
                    }
                },
                {
                    name: "discounts",
                    in: "query",
                    description: "Array of selected discount options. Valid values: 'Зі знижкою' or 'Без знижки'. Filters products by discount presence.",
                    required: false,
                    schema: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["Зі знижкою", "Без знижки"]
                        },
                        example: ["Зі знижкою"]
                    }
                },
                {
                    name: "minPrice",
                    in: "query",
                    description: "Minimum price filter (inclusive). Must be positive integer. Used with maxPrice for price range filtering.",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 0,
                        example: 100
                    }
                },
                {
                    name: "maxPrice",
                    in: "query",
                    description: "Maximum price filter (inclusive). Must be positive integer and >= minPrice if both provided.",
                    required: false,
                    schema: {
                        type: "integer",
                        minimum: 0,
                        example: 1000
                    }
                },
                {
                    name: "search",
                    in: "query",
                    description: "Search query for products. Minimum 4 characters to activate. Searches: product name (start/space/slash/dash boundaries), manufacturer (start/space), code (anywhere). Multi-word support with AND logic.",
                    required: false,
                    schema: {
                        type: "string",
                        minLength: 4,
                        example: "масляний фільтр bosch"
                    }
                }
            ],
            responses: {
                "200": {
                    description: "Successfully retrieved filters",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                description: "Array of filters with their values. Filters are conditionally included based on data availability.",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "string",
                                            description: "Filter's unique identifier: '1'=Виробники, '2'=Підкатегорії, '3'=Знижки",
                                            enum: ["1", "2", "3"],
                                            example: "1"
                                        },
                                        name: {
                                            type: "string",
                                            description: "Filter's display name in Ukrainian",
                                            enum: ["Виробники", "Підкатегорії", "Знижки"],
                                            example: "Виробники"
                                        },
                                        filterValues: {
                                            type: "array",
                                            description: "Available values for this filter. For Виробники: includes selected + available. For Підкатегорії: includes selected + direct children with products. For Знижки: always both options.",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    id: {
                                                        type: "string",
                                                        description: "Value identifier. Виробники: 'id_' + manufacturer name. Підкатегорії: category UUID. Знижки: '1' or '2'.",
                                                        example: "id_Bosch"
                                                    },
                                                    name: {
                                                        type: "string",
                                                        description: "Value's display name. Виробники: manufacturer name. Підкатегорії: category name. Знижки: 'Зі знижкою' or 'Без знижки'.",
                                                        example: "Bosch"
                                                    }
                                                },
                                                required: ["id", "name"]
                                            }
                                        }
                                    },
                                    required: ["id", "name", "filterValues"]
                                },
                                example: [
                                    {
                                        id: "1",
                                        name: "Виробники",
                                        filterValues: [
                                            { id: "id_Bosch", name: "Bosch" },
                                            { id: "id_Mann", name: "Mann" },
                                            { id: "id_Mahle", name: "Mahle" }
                                        ]
                                    },
                                    {
                                        id: "2",
                                        name: "Підкатегорії",
                                        filterValues: [
                                            { id: "abc123-uuid-1234", name: "Масляні фільтри" },
                                            { id: "def456-uuid-5678", name: "Паливні фільтри" }
                                        ]
                                    },
                                    {
                                        id: "3",
                                        name: "Знижки",
                                        filterValues: [
                                            { id: "1", name: "Зі знижкою" },
                                            { id: "2", name: "Без знижки" }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation error - invalid query parameters",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        description: "Comma-separated validation error messages",
                                        example: "Each subcategory must be a valid UUID"
                                    }
                                }
                            },
                            examples: {
                                invalidSubcategories: {
                                    summary: "Invalid subcategory UUIDs",
                                    value: {
                                        message: "Each subcategory must be a valid UUID"
                                    }
                                },
                                invalidPriceRange: {
                                    summary: "Invalid price range",
                                    value: {
                                        message: "Maximum price cannot be less than minimum price"
                                    }
                                },
                                invalidDiscounts: {
                                    summary: "Invalid discount values",
                                    value: {
                                        message: "Discounts must be 'Зі знижкою' or 'Без знижки'"
                                    }
                                },
                                invalidManufacturers: {
                                    summary: "Invalid manufacturers array",
                                    value: {
                                        message: "Each manufacturer must be a string"
                                    }
                                },
                                multipleErrors: {
                                    summary: "Multiple validation errors",
                                    value: {
                                        message: "Minimum price must be a positive integer, Each subcategory must be a valid UUID"
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