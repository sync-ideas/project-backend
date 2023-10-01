import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import { prisma } from '../config/prisma.client.js';
import { jwt_secret } from '../config/environment.js';

passport.use(
  'userJWT',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_secret,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: payload.email,
          },
        });

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  'adminJWT',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_secret,
    },
    async (payload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: payload.email,
          },
        });

        if (!user || user.role !== 'admin') {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export const generateToken = (email: string) => {
  return jwt.sign({ email }, jwt_secret, { expiresIn: '1h' });
}


export default passport;