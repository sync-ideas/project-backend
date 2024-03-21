import { prisma } from "../config/prisma.client.js";

//import NodeCache from 'node-cache';
//const cache = new NodeCache();

const loginHelper = {

  getAttempts: async (email: string) => {
    try {
      const attempts = await prisma.loginAttempts.findUnique({
        where: {
          email
        }
      })
      if (!attempts) {
        await prisma.loginAttempts.create({
          data: {
            email
          }
        })
        return true
      } else if (attempts.createdAt < new Date(Date.now() - 1800000)) {
        await prisma.loginAttempts.update({
          where: {
            email
          }, data: {
            attempts: 1,
            createdAt: new Date()
          }
        })
        return true
      } else if (attempts.attempts < 3) {
        await prisma.loginAttempts.update({
          where: {
            email
          }, data: {
            attempts: attempts.attempts + 1
          }
        })
        return true
      } else {
        return false
      }

      //const timeout = cache.get(email + '_timeout') || false;
      //!timeout && cache.del(email + '_attempts');   // Clean attempts if there is no timeout
      //const attempts = cache.get(email + '_attempts') || 0;
      //if (attempts === 3 && timeout) {
      //  return false
      //}
      //return true

    } catch (error) {
      throw new Error(error);
    }
  },

  addAttemt: async (email: string) => {
    try {
      await prisma.loginAttempts.update({
        where: {
          email
        },
        data: {
          attempts: {
            increment: 1
          }
        }
      })
      //const attempts: number = cache.get(email + '_attempts') || 0;
      //cache.set(email + '_attempts', attempts + 1, 1800);
      //if (attempts + 1 === 1) { // First attempt?
      //  cache.set(email + '_timeout', true, 1800);
      //}
    } catch (error) {
      throw new Error(error);
    }
  },

  deleteAttempts: async (email: string) => {
    try {
      await prisma.loginAttempts.update({
        where: {
          email
        }, data: {
          attempts: 0
        }
      })

      //cache.del(email + '_attempts');
      //cache.del(email + '_timeout');
    } catch (error) {
      throw new Error(error);
    }
  }



}

export default loginHelper