import { prisma } from "../config/prisma.client.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Response,Request } from "express";
import { SECRETORPRIVATEKEY } from "../config/environment.js";
import bcrypt from "bcrypt";

dotenv.config();
const privateKey = SECRETORPRIVATEKEY as string;

export const authController = async (req: Request, res: Response) => {
  const  email  = req.body;
  const password = req.body;
  try {
    const usuario = await prisma.users.findUniqueOrThrow({
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
    const token = jwt.sign(
      {
        id: usuario.id,
      },
      privateKey,
      {
        expiresIn: "36000s",
      }
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error en el servidor");
  }
};