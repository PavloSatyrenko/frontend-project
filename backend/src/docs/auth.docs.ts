import { Paths } from "swagger-jsdoc";

export const authDocs: Paths = {
    "/auth/sign-up": {
        post: {
            summary: "Register new user account",
            description: "Creates a new user account with secure authentication.\n\n" +
                "Security features:\n" +
                "• Rate limited to 5 requests per 2 minutes\n" +
                "• Password is hashed using bcrypt with 12 rounds\n" +
                "• Returns JWT tokens in response body\n" +
                "• Access token expires in 15 minutes\n" +
                "• Refresh token expires in 7 days (default, configurable via environment)\n\n" +
                "Validation requirements:\n" +
                "• Phone: Valid Ukrainian mobile phone number\n" +
                "• Name: 2-100 characters, escaped for security\n" +
                "• Surname: 2-100 characters, escaped for security\n" +
                "• Role: WHOLESALE, SERVICE_STATION, or RETAIL\n" +
                "• Password: 6-100 characters\n\n" +
                "Account initialization:\n" +
                "• Returns authentication tokens in response\n" +
                "• Initial discount set to 0\n" +
                "• Email is initially set to null",
            tags: ["Auth"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["phone", "name", "surname", "role", "password"],
                            properties: {
                                phone: {
                                    type: "string",
                                    description: "Valid Ukrainian mobile phone number",
                                    example: "0991234567"
                                },
                                name: {
                                    type: "string",
                                    description: "User's first name (2-100 characters)",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "John"
                                },
                                surname: {
                                    type: "string",
                                    description: "User's last name (2-100 characters)",
                                    minLength: 2,
                                    maxLength: 100,
                                    example: "Doe"
                                },
                                role: {
                                    type: "string",
                                    enum: ["WHOLESALE", "SERVICE_STATION", "RETAIL"],
                                    description: "User role - one of WHOLESALE, SERVICE_STATION, or RETAIL",
                                    example: "RETAIL"
                                },
                                password: {
                                    type: "string",
                                    description: "Password (6-100 characters)",
                                    minLength: 6,
                                    maxLength: 100,
                                    example: "HardPassword123"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "201": {
                    description: "User signed up successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    accessToken: {
                                        type: "string",
                                        description: "JWT access token (expires in 15 minutes)",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    },
                                    refreshToken: {
                                        type: "string",
                                        description: "JWT refresh token (expires in 7 days)",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    }
                                }
                            }
                        }
                    }
                },
                "400": {
                    description: "Bad request - user already exists",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "User account with that phone number already exists"
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
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "Name is required" },
                                            { example: "Name must be a string" },
                                            { example: "Name must be between 2 and 100 characters" },
                                            { example: "Surname is required" },
                                            { example: "Surname must be a string" },
                                            { example: "Surname must be between 2 and 100 characters" },
                                            { example: "Role is required" },
                                            { example: "Role must be a string" },
                                            { example: "Role must be either 'WHOLESALE', 'SERVICE_STATION' or 'RETAIL'" },
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Password must be between 6 and 100 characters" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "429": {
                    description: "Rate limit exceeded - too many requests",
                    headers: {
                        "Retry-After": {
                            description: "Time in seconds to wait before retrying",
                            schema: {
                                type: "integer",
                                example: 120
                            }
                        }
                    },
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Too many sign up attempts, please try again later."
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
    "/auth/login": {
        post: {
            summary: "Log into the user account",
            description: "Authenticates the user with phone and password.\n\n" +
                "Security features:\n" +
                "• Rate limited to 5 requests per 2 minutes\n" +
                "• Password is verified using bcrypt\n" +
                "• Returns JWT tokens in response body\n" +
                "• Access token expires in 15 minutes\n" +
                "• Refresh token expires in 7 days (default, configurable via environment)\n\n" +
                "Validation requirements:\n" +
                "• Phone: Valid Ukrainian mobile phone number\n" +
                "• Password: 6-100 characters\n\n" +
                "Authentication tokens:\n" +
                "• accessToken: JWT with user ID and role for authorization\n" +
                "• refreshToken: Token for obtaining new access tokens",
            tags: ["Auth"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["phone", "password"],
                            properties: {
                                phone: {
                                    type: "string",
                                    description: "Valid Ukrainian mobile phone number",
                                    example: "0991234567"
                                },
                                password: {
                                    type: "string",
                                    description: "Password (6-100 characters)",
                                    minLength: 6,
                                    maxLength: 100,
                                    example: "HardPassword123"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "User logged in successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    accessToken: {
                                        type: "string",
                                        description: "JWT access token (expires in 15 minutes)",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    },
                                    refreshToken: {
                                        type: "string",
                                        description: "JWT refresh token (expires in 7 days)",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation errors",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        description: "Validation error message(s)",
                                        oneOf: [
                                            { example: "Phone number is required" },
                                            { example: "Please provide a valid phone number" },
                                            { example: "Password is required" },
                                            { example: "Password must be a string" },
                                            { example: "Password must be between 6 and 100 characters" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Invalid credentials",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Invalid credentials"
                                    }
                                }
                            }
                        }
                    }
                },
                "429": {
                    description: "Rate limit exceeded - too many login attempts",
                    headers: {
                        "Retry-After": {
                            description: "Time in seconds to wait before retrying",
                            schema: {
                                type: "integer",
                                example: 120
                            }
                        }
                    },
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Too many login attempts, please try again later."
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
    "/auth/logout": {
        post: {
            summary: "Log out of the user account",
            description: "Logs out the current user.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Requires valid Bearer token in Authorization header\n" +
                "• Client should discard tokens after logout\n\n" +
                "Token handling:\n" +
                "• Client is responsible for discarding access and refresh tokens\n" +
                "• Server returns success response\n" +
                "• Tokens remain valid until expiry (stateless)\n\n" +
                "The logout response indicates successful logout - client should discard tokens.",
            tags: ["Auth"],
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [],
            responses: {
                "200": {
                    description: "User logged out successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Logged out successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Unauthorized - missing or invalid Bearer token",
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
    "/auth/refresh": {
        post: {
            summary: "Refresh access token",
            description: "Refreshes an expired access token using a valid refresh token.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• Does NOT require a valid access token\n" +
                "• Only needs valid refresh token in request body\n" +
                "• Returns new access token in response body\n\n" +
                "Token handling:\n" +
                "• Access token is refreshed if refresh token is valid\n" +
                "• New access token expires in 15 minutes\n" +
                "• Token is returned in response body\n" +
                "• Original refresh token remains unchanged\n\n" +
                "Important note: Use this endpoint when access token expires but refresh token is still valid.",
            tags: ["Auth"],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["refreshToken"],
                            properties: {
                                refreshToken: {
                                    type: "string",
                                    description: "Valid refresh token obtained from login/signup",
                                    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Access token refreshed successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    accessToken: {
                                        type: "string",
                                        description: "New JWT access token (expires in 15 minutes)",
                                        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    }
                                }
                            }
                        }
                    }
                },
                "422": {
                    description: "Validation errors",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        description: "Validation error message",
                                        oneOf: [
                                            { example: "Refresh token is required" },
                                            { example: "Refresh token must be a string" }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                "403": {
                    description: "Invalid or expired refresh token",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Invalid or expired token"
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
    "/auth/create-admin": {
        post: {
            summary: "Create admin account",
            description: "Creates an admin account with predefined credentials.\n\n" +
                "Security features:\n" +
                "• Rate limited to 300 requests per 10 minutes\n" +
                "• No authentication required (for initial setup)\n" +
                "• Idempotent - returns success if admin already exists\n" +
                "• Password is hashed using bcrypt with 12 rounds\n\n" +
                "Important: This endpoint should be disabled in production or protected by additional security measures.",
            tags: ["Auth", "Admin"],
            responses: {
                "201": {
                    description: "Admin account created successfully (or already exists)",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Admin account created successfully"
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