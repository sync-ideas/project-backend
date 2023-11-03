import QrGenerator from '../handlers/qrGenerator.handler.js';
import { Readable } from 'stream';
const QRController = {
    async create(req, res) {
        try {
            const { data } = req.body;
            if (!data) {
                return res.status(400).json({
                    msg: 'No data provided',
                    response: false
                });
            }
            const generatedPDF = await QrGenerator.create(data);
            if (generatedPDF) {
                //const pdfBuffer = Buffer.from(generatedPDF);
                const pdfBuffer = new Readable({
                    read() {
                        this.push(Buffer.from(generatedPDF));
                        this.push(null);
                    }
                });
                res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
                res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
                //return res.status(200).send(pdfBuffer);
                pdfBuffer.pipe(res);
            }
            else {
                return res.status(500).json({
                    msg: 'PDF generation failed',
                    response: false
                });
            }
        }
        catch (error) {
            return res.status(500).json({
                msg: 'Internal server error',
                response: false
            });
        }
    }
};
export default QRController;
//# sourceMappingURL=qr.controller.js.map