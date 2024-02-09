import QrHandler from '../handlers/qr.handler.js';
import { Readable } from 'stream';
const QRController = {
    async create(req, res) {
        try {
            const { data, pageSizeMm, qrSizeMm, marginMm } = req.body;
            if (!data || !pageSizeMm || !qrSizeMm || !marginMm) {
                return res.status(400).json({
                    msg: 'No data or size provided',
                    response: false
                });
            }
            const generatedPDF = await QrHandler.create(data, pageSizeMm, qrSizeMm, marginMm);
            if (generatedPDF) {
                const pdfBuffer = new Readable({
                    read() {
                        this.push(Buffer.from(generatedPDF));
                        this.push(null);
                    }
                });
                res.setHeader('Content-Type', 'application/pdf; charset=utf-8');
                res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
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