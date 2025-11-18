import { jwt } from "utils/jwt";
import { RefreshToken, Role, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { authRepository } from "repositories/auth.repository";

export const authService = {
    async signUpUser(phone: string, name: string, surname: string, role: Role, password: string): Promise<{ accessToken: string, refreshToken: string } | null> {
        try {
            if (phone.startsWith("+38")) {
                phone = phone.slice(3);
            }

            const existingUser: User | null = await authRepository.findUserByPhone(phone);

            if (existingUser && existingUser.isRegistered) {
                return null;
            }

            const passwordHash: string = await bcrypt.hash(password, 12);

            const newUser: Omit<User, "id" | "discount" | "isRegistered"> = {
                name,
                surname,
                phone,
                role,
                passwordHash,
                email: null,
            };

            let user: User;

            if (existingUser && !existingUser.isRegistered) {
                user = await authRepository.makeUserRegistered(existingUser.id, newUser);
            }
            else {
                user = await authRepository.createUser(newUser);
            }

            const accessToken: string = jwt.generateAccessToken(user.id, user.role);
            const refreshToken: string = jwt.generateRefreshToken(user.id, user.role);

            await authRepository.createRefreshToken(refreshToken, user.id);

            return { accessToken, refreshToken };
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async loginUser(phone: string, password: string): Promise<{ accessToken: string, refreshToken: string } | null> {
        try {
            if (phone.startsWith("+38")) {
                phone = phone.slice(3);
            }

            const user: User | null = await authRepository.findUserByPhone(phone);

            if (!user || !user.isRegistered || !(bcrypt.compareSync(password, user.passwordHash!))) {
                return null;
            }

            const accessToken: string = jwt.generateAccessToken(user.id, user.role);
            const refreshToken: string = jwt.generateRefreshToken(user.id, user.role);

            await authRepository.createRefreshToken(refreshToken, user.id);

            return { accessToken, refreshToken };
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async refreshAccessToken(refreshToken: string): Promise<string | null> {
        try {
            const existingRefreshToken: RefreshToken | null = await authRepository.findRefreshToken(refreshToken);

            if (!existingRefreshToken) {
                return null;
            }

            const user: { id: string, role: string } = jwt.verifyRefreshToken(refreshToken);

            const accessToken: string = jwt.generateAccessToken(user.id, user.role);

            return accessToken;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    },

    async createAdmin(): Promise<void> {
        try {
            const adminPhone: string = "0999999999";
            const adminName: string = "Admin";
            const adminSurname: string = "Admin";
            const adminRole: Role = "ADMIN";
            const adminPassword: string = "Adm1nP@ssw0rd!";

            const existingUser: User | null = await authRepository.findUserByPhone(adminPhone);

            if (existingUser) {
                return;
            }

            const passwordHash: string = await bcrypt.hash(adminPassword, 12);

            const newUser: Omit<User, "id" | "discount" | "isRegistered"> = {
                name: adminName,
                surname: adminSurname,
                phone: adminPhone,
                role: adminRole,
                passwordHash,
                email: null,
            };

            await authRepository.createUser(newUser);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
};