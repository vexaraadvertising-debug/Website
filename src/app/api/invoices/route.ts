import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // In a real scenario, we'd fetch the order from the DB:
    // const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
    
    // Mock data for generation
    const mockOrder = {
      orderNumber: `ORD-${orderId.substring(0, 8)}`,
      date: new Date().toLocaleDateString(),
      customer: 'John Doe',
      total: 2499.00,
      items: [
        { name: 'Oversized Anime T-Shirt - Black / M', price: 1299.00, qty: 1 },
        { name: 'Minimalist Essential - White / L', price: 1200.00, qty: 1 }
      ]
    };

    // 1. Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 2. Add Branding (ORINKO)
    page.drawText('ORINKO', { x: 50, y: height - 60, size: 28, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('Print Your Style', { x: 50, y: height - 75, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText('TAX INVOICE', { x: width - 150, y: height - 60, size: 18, font: boldFont, color: rgb(0, 0, 0) });

    // 3. Add Order Details
    page.drawText(`Order No: ${mockOrder.orderNumber}`, { x: width - 200, y: height - 100, size: 10, font });
    page.drawText(`Date: ${mockOrder.date}`, { x: width - 200, y: height - 115, size: 10, font });
    page.drawText(`Billed To: ${mockOrder.customer}`, { x: 50, y: height - 120, size: 12, font: boldFont });

    // 4. Draw Table Header
    const tableY = height - 180;
    page.drawRectangle({ x: 50, y: tableY - 5, width: width - 100, height: 20, color: rgb(0.95, 0.95, 0.95) });
    page.drawText('Item Description', { x: 60, y: tableY, size: 10, font: boldFont });
    page.drawText('Qty', { x: 350, y: tableY, size: 10, font: boldFont });
    page.drawText('Price', { x: 400, y: tableY, size: 10, font: boldFont });
    page.drawText('Total', { x: 480, y: tableY, size: 10, font: boldFont });

    // 5. Draw Items
    let currentY = tableY - 30;
    mockOrder.items.forEach(item => {
      page.drawText(item.name, { x: 60, y: currentY, size: 10, font });
      page.drawText(item.qty.toString(), { x: 350, y: currentY, size: 10, font });
      page.drawText(`Rs. ${item.price.toFixed(2)}`, { x: 400, y: currentY, size: 10, font });
      page.drawText(`Rs. ${(item.price * item.qty).toFixed(2)}`, { x: 480, y: currentY, size: 10, font });
      currentY -= 25;
    });

    // 6. Draw Totals & GST
    page.drawLine({ start: { x: 300, y: currentY + 10 }, end: { x: width - 50, y: currentY + 10 }, thickness: 1 });
    page.drawText('Subtotal:', { x: 350, y: currentY - 10, size: 10, font: boldFont });
    page.drawText(`Rs. ${mockOrder.total.toFixed(2)}`, { x: 480, y: currentY - 10, size: 10, font });
    
    page.drawText('Total (incl. GST):', { x: 350, y: currentY - 30, size: 12, font: boldFont });
    page.drawText(`Rs. ${mockOrder.total.toFixed(2)}`, { x: 480, y: currentY - 30, size: 12, font: boldFont });

    // 7. Add QR Code for tracking
    const trackingUrl = `https://orinko.in/track/${mockOrder.orderNumber}`;
    const qrImageDataUrl = await QRCode.toDataURL(trackingUrl);
    const qrImageBytes = Buffer.from(qrImageDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    page.drawImage(qrImage, {
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });
    page.drawText('Scan to track order', { x: 50, y: 35, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    // Return as downloadable file
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${mockOrder.orderNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Failed to generate invoice:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}
