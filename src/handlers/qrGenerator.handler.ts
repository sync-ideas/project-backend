import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';

import { Student } from "../types/data.types.js"

const QrGenerator = {
  async create(data: Student[]) {
    const mm2dot = 2.8352
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([220 * mm2dot, 297 * mm2dot]);
    // const {width,page} = page.getSize()
    let qrCount=0;

    for (let i = 0; i < data.length; i++) {
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(data[i]));
      const qrBuffer = Buffer.from(qrCodeImage.match(/,(.*)$/)[1], 'base64');
      const qrImage = await pdfDoc.embedPng(qrBuffer);
      
      // El ancho y el alto de cada QR en puntos
      const qrWidth = 50 * mm2dot
      const qrHeight = 50 * mm2dot
      const pageHeight  = page.getHeight();
      // El margen horizontal y vertical entre los QR en puntos
      const qrMarginX =3 * mm2dot;
      const qrMarginY =5 * mm2dot;
      console.log(pageHeight )

      page.drawImage(qrImage, {
        x: (i % 4) * (qrWidth + qrMarginX),
        y: (pageHeight -180) - (Math.floor(i / 4) * (qrHeight + qrMarginY)),
        width: qrWidth,
        height: qrHeight,
      });

      page.drawText(data[i].fullname, {
        x: (i % 4) * (qrWidth + qrMarginX),
        y: (pageHeight -180) - Math.floor(i / 4) * (qrHeight + qrMarginY),
        size: 12,
      });

      page.drawRectangle({
        x: (i % 4) * (qrWidth + qrMarginX),
        y:  (pageHeight -180) - (Math.floor(i / 4) * (qrHeight + qrMarginY)),
        width: qrWidth,
        height: qrHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      
      // Si el conteo llega a 12, crear una nueva página y reiniciar el conteo
      qrCount++;
      if (qrCount === 12) {
        page = pdfDoc.addPage([220 * mm2dot, 297 * mm2dot]);
        qrCount = 0;
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

export default QrGenerator;
