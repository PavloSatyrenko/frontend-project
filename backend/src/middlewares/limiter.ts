import rateLimit from "express-rate-limit";

export const signUpLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many sign up attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

export const loginLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});

export const generalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 300,
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});