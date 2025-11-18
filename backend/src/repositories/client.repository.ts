import { PrismaClient, Role, User } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

export const clientRepository = {
    async getClients(page: number, pageSize: number, role?: Role, search?: string): Promise<{ clients: (Omit<User, "passwordHash"> & { _count: { orders: number } })[], totalCount: number }> {
        const words: string[] = search?.split(/\s+/).filter(Boolean) ?? [];

        const whereStatement = {
            ...(
                search && {
                    AND: words.map((word: string) => ({
                        OR: [
                            {
                                name: {
                                    startsWith: word,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                name: {
                                    contains: ` ${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                surname: {
                                    startsWith: word,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                surname: {
                                    contains: ` ${word}`,
                                    mode: "insensitive" as const
                                }
                            },
                            {
                                phone: {
                                    contains: word,
                                    mode: "insensitive" as const
                                }
                            }
                        ]
                    }))
                }
            ),
            ...(
                role && {
                    role: role
                }
            )
        };

        const [clients, { _count: totalCount }] = await Promise.all([
            prisma.user.findMany({
                where: whereStatement,
                omit: {
                    passwordHash: true
                },
                include: {
                    _count: {
                        select: {
                            orders: true
                        }
                    }
                },
                orderBy: [
                    {
                        orders: {
                            _count: "desc"
                        }
                    },
                    {
                        name: "asc"
                    }
                ],
                skip: (page - 1) * pageSize,
                take: pageSize
            }),

            prisma.user.aggregate({
                where: whereStatement,
                _count: true
            })
        ]);

        return {
            clients,
            totalCount
        }
    },

    async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
        return prisma.user.findUnique({
            where: {
                id: id
            },
            omit: {
                passwordHash: true
            }
        });
    },

    async updateClient(clientId: string, name: string, surname: string, phone: string, role: Role, email: string, discount: number): Promise<void> {
        await prisma.user.update({
            where: {
                id: clientId
            },
            data: {
                name,
                surname,
                phone,
                role,
                email,
                discount
            }
        });
    },

    async updatePersonalData(userId: string, name: string, surname: string, phone: string, email: string, passwordHash?: string): Promise<void> {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                name,
                surname,
                phone,
                email,
                ...(passwordHash && { passwordHash })
            }
        });
    }
}