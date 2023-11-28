import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';

import { Student } from "../types/data.types.js"


const QrHandler = {

  async create(data: Student[]) {

    const mm2dot = 2.8352; // 1 mm = 2.8352 dots
    const pageSize = { width: 210 * mm2dot, height: 297 * mm2dot }
    const qrSize = { width: 80 * mm2dot, height: 80 * mm2dot }
    const margin = 20 * mm2dot
    const horizontalStudents = Math.floor(pageSize.width / (qrSize.width + margin));
    const verticalStudents = Math.floor(pageSize.height / (qrSize.height + margin));
    const studentsPerPage = horizontalStudents * verticalStudents;
    const totalPages = Math.ceil(data.length / studentsPerPage)

    const pdfDoc = await PDFDocument.create();
    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const page = pdfDoc.addPage([pageSize.width, pageSize.height]);

      for (let i = pageIdx * studentsPerPage; i < Math.min((pageIdx + 1) * studentsPerPage, data.length); i++) {
        let qrCodeImage = await QRCode.toDataURL(JSON.stringify(data[i]));
        let qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
        let qrImage = await pdfDoc.embedPng(qrBuffer);

        const col = i % horizontalStudents;
        const row = Math.floor((i - (pageIdx * studentsPerPage)) / horizontalStudents);

        page.drawImage(qrImage, {
          x: (qrSize.width * col + margin * (1 + col)),
          y: (margin + row * (qrSize.height + margin)),
          width: qrSize.width,
          height: qrSize.height,
        })

        page.drawRectangle({
          x: (qrSize.width * col + margin * (1 + col)),
          y: (margin + row * (qrSize.height + margin)),
          width: qrSize.width,
          height: qrSize.height,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
        })

        page.drawText(data[i].fullname, {
          x: (qrSize.width * col + margin * (1 + col)),
          y: (margin + row * (qrSize.height + margin) + qrSize.height + 3),
          size: 12
        })
      }

    }

    try {
      const pdfBytes = await pdfDoc.save();
      return pdfBytes
    } catch (error) {
      console.error(error);
      return null
    }
  }


}

export default QrHandler;
