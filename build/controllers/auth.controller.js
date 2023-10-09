import { prisma } from '../config/prisma.client.js';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwt_secret, bcrypt_rounds } from '../config/environment.js';
const password_salt = bcrypt.genSaltSync(bcrypt_rounds);
const AuthController = {
    login: async (req, res) => {
        const email = req.body;
        const password = req.body;
        try {
            const usuario = await prisma.user.findUniqueOrThrow({
                where: {
                    email,
                },
            });
            if (!usuario) {
                return res.status(404).json({
                    msg: "Error: Usuario no encontrado",
                });
            }
            const passwordMatch = await bcrypt.compare(password, usuario.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    msg: "Error: Contraseña incorrecta",
                });
            }
            const token = jwt.sign({ id: usuario.id }, jwt_secret, { expiresIn: "36000s" });
            return res.status(200).json({ token });
        }
        catch (error) {
            console.error(error);
            return res.status(500).send("Error en el servidor");
        }
    },
};
export default AuthController;
//# sourceMappingURL=auth.controller.js.map