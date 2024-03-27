import { prisma } from "../config/prisma.client.js";
//import NodeCache from 'node-cache';
//const cache = new NodeCache();
const loginHelper = {
    getAttempts: async (email) => {
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
            //const timeout = cache.get(email + '_timeout') || false;
            //!timeout && cache.del(email + '_attempts');   // Clean attempts if there is no timeout
            //const attempts = cache.get(email + '_attempts') || 0;
            //if (attempts === 3 && timeout) {
            //  return false
            //}
            //return true
        }
        catch (error) {
            throw new Error(error);
        }
    },
    addAttemt: async (email) => {
        try {
            await prisma.loginattempts.update({
                where: {
                    email
                },
                data: {
                    attempts: {
                        increment: 1
                    }
                }
            });
            //const attempts: number = cache.get(email + '_attempts') || 0;
            //cache.set(email + '_attempts', attempts + 1, 1800);
            //if (attempts + 1 === 1) { // First attempt?
            //  cache.set(email + '_timeout', true, 1800);
            //}
        }
        catch (error) {
            throw new Error(error);
        }
    },
    deleteAttempts: async (email) => {
        try {
            await prisma.loginattempts.update({
                where: {
                    email
                }, data: {
                    attempts: 0
                }
            });
            //cache.del(email + '_attempts');
            //cache.del(email + '_timeout');
        }
        catch (error) {
            throw new Error(error);
        }
    }
};
export default loginHelper;
//# sourceMappingURL=login.helper.js.map