import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
const QrGenerator = {
    async create(data) {
        const mm2dot = 2.8352;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([210 * mm2dot, 297 * mm2dot]);
        let file = -1;
        for (let i = 0; i < data.length; i++) {
            let qrCodeImage = await QRCode.toDataURL(JSON.stringify(data[i]));
            let qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
            let qrImage = await pdfDoc.embedPng(qrBuffer);
            file += i % 3 === 0 ? 1 : 0;
            page.drawImage(qrImage, {
                x: (70 * i + 10) * mm2dot,
                y: (10 + file * 70) * mm2dot,
                width: 50 * mm2dot,
                height: 50 * mm2dot
            });
            page.drawText(data[i].fullname, {
                x: (70 * i + 22) * mm2dot,
                y: (56 + file * 70) * mm2dot,
                size: 12
            });
            page.drawRectangle({
                x: (70 * i + 10) * mm2dot,
                y: (10 + file * 70) * mm2dot,
                width: 50 * mm2dot,
                height: 50 * mm2dot,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });
        }
        try {
            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
};
export default QrGenerator;
//# sourceMappingURL=qrGenerator.handler.js.map