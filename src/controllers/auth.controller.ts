import { prisma } from "../config/prisma.client.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Response,Request } from "express";
import { SECRETORPRIVATEKEY } from "../config/environment.js";
import bcrypt from "bcrypt";

dotenv.config();
const privateKey = SECRETORPRIVATEKEY as string;

export const authController = async (req:Request,res:Response) => {
  
  try {
    const email = await req.body as string;
    const password = await req.body as string;
    console.log({email,password});

    const usuario = await prisma.users.findUnique({
      where: {
        email: email,
      }
    });
    console.log(usuario)

    if (!usuario) {
      res.status(404).json({
        msg: "Error: Usuario no encontrado",
      });
      return;
    }

    // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      res.status(401).json({
        msg: "Error: Contraseña incorrecta",
      });
      return;
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
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el servidor");
  }
};
