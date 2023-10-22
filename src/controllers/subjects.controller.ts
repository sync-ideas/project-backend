import { Request, Response } from "express-serve-static-core";
import { prisma } from "../config/prisma.client.js";

const SubjectsController = {

  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.subject_id as string);
      if (!id) {
        return res.status(400).json({
          result: false,
          message: 'Id is required',
        });
      }
      const subject = await prisma.subject.update({
        where: {
          id: id,
          active: true,
        },
        data: {
          active: false,
          updatedAt: new Date(),
        },
      });
      if (subject) {
        return res.status(200).json({
          result: true,
          message: "Subject deleted",
          subject,
        })
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        result: false,
        message: "Internal server error",
      });
    }
  },

}

export default SubjectsController;