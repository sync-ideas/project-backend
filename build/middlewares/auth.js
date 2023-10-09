import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.client.js';
import { jwt_secret } from '../config/environment.js';
passport.use('userJWT', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt_secret,
}, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: payload.id,
            },
        });
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
passport.use('adminJWT', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwt_secret,
}, async (payload, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: payload.id,
            },
        });
        if (!user || user.role !== 'ADMIN') {
            return done(null, false);
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
export const generateToken = (email) => {
    return jwt.sign({ email }, jwt_secret, { expiresIn: '1h' });
};
export default passport;
//# sourceMappingURL=auth.js.map