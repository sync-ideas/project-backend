import { prisma } from "../config/prisma.client.js";
const userHelper = {
    isValidEmail: (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    isValidPassword: (password) => {
        return password.length >= 8;
    },
    getLoginAttempts: async (email) => {
        try {
            const attempts = await prisma.loginattempts.findUnique({
                where: {
                    email
                }
            });
            if (!attempts) {
                await prisma.loginattempts.create({
                    data: {
                        email
                    }
                });
                return 2;
            }
            else if (attempts.createdAt < new Date(Date.now() - 1800000)) { // 30 minutes passed
                await prisma.loginattempts.update({
                    where: {
                        email
                    }, data: {
                        attempts: 1,
                        createdAt: new Date()
                    }
                });
                return 2;
            }
            else if (attempts.attempts < 3) {
                await prisma.loginattempts.update({
                    where: {
                        email
                    }, data: {
                        attempts: attempts.attempts + 1
                    }
                });
                return 2 - attempts.attempts;
            }
            else {
                return -1;
            }
        }
        catch (error) {
            throw new Error(error);
        }
    },
    deleteLoginAttempts: async (email) => {
        try {
            await prisma.loginattempts.update({
                where: {
                    email
                }, data: {
                    attempts: 0
                }
            });
        }
        catch (error) {
            throw new Error(error);
        }
    },
    getEmailSendCode: async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.activation.create({
            data: {
                email,
                code
            }
        });
        return code;
    },
    checkEmailCode: async (code) => {
        const emailCodes = await prisma.activation.findUnique({ where: { code } });
        if (!emailCodes)
            return { success: false, message: 'Invalid code.' };
        if (emailCodes.createdAt < new Date(Date.now() - 60 * 60 * 1000)) {
            await prisma.activation.delete({ where: { code } });
            return { success: false, message: 'Code expired.' };
        }
        await prisma.activation.deleteMany({ where: { email: emailCodes.email } });
        return { success: true, message: 'Email verified.', email: emailCodes.email };
    }
};
export default userHelper;
//# sourceMappingURL=user.helper.js.map