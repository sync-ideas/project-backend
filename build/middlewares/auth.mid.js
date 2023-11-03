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
        if (!payload.id) {
            return done(null, false);
        }
        return done(null, payload);
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
export const generateToken = (id) => {
    return jwt.sign({ id }, jwt_secret, { expiresIn: '1h' });
};
export default passport;
//# sourceMappingURL=auth.mid.js.map