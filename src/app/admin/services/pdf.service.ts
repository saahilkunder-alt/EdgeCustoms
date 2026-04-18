import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { JobCard } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  async generateJobCardPdf(job: JobCard): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const currency = 'Rs.';
    let currentY = margin;

    // ── Helpers ──
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(x1, y1, x2, y2);
    };

    const amountToWords = (num: number): string => {
      const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
      const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];
      const format = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + format(n % 100);
        if (n < 100000) return format(Math.floor(n / 1000)) + 'Thousand ' + format(n % 1000);
        if (n < 10000000) return format(Math.floor(n / 100000)) + 'Lakh ' + format(n % 100000);
        return format(Math.floor(n / 10000000)) + 'Crore ' + format(n % 10000000);
      };
      return 'INR ' + format(Math.floor(num)) + 'Only';
    };

    const renderHeader = (isFirstPage: boolean, currentP: number) => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);

      if (isFirstPage) {
        // Main Logo & Title
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(32);
        doc.text('Tax Invoice', margin + 10, margin + 17);
        try {
          doc.addImage('/logo.png', 'PNG', pageWidth / 2 + 5, margin + 4, 25, 18);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(24);
          doc.text('Edge Customs', pageWidth / 2 + 32, margin + 16.5);
        } catch (e) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(24);
          doc.text('Edge Customs', pageWidth / 2 + 10, margin + 16.5);
        }
        drawLine(margin, margin + 25, pageWidth - margin, margin + 25);

        // Addresses
        let addrY = margin + 25;
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, addrY, contentWidth, 6, 'F');
        drawLine(margin, addrY + 6, pageWidth - margin, addrY + 6);
        drawLine(margin, addrY + 35, pageWidth - margin, addrY + 35);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Invoice From:', margin + contentWidth / 4, addrY + 4.2, { align: 'center' });
        doc.text('Invoice To:', margin + (3 * contentWidth) / 4, addrY + 4.2, { align: 'center' });

        const addAddressBlock = (x: number, y: number, data: any) => {
          doc.setFont('helvetica', 'bold');
          doc.text('Name:', x, y + 10);
          doc.text('Address:', x, y + 15);
          doc.text('Phone:', x, y + 24);
          doc.text('Email Id:', x, y + 29);
          doc.text('GST No:', x, y + 34);
          doc.setFont('helvetica', 'normal');
          doc.text(data.name || '—', x + 25, y + 10);
          const addrLines = doc.splitTextToSize(data.address || '—', (contentWidth / 2) - 30);
          doc.text(addrLines, x + 25, y + 15);
          doc.text(data.phone || '—', x + 25, y + 24);
          doc.text(data.email || '—', x + 25, y + 29);
          doc.text(data.gst || '—', x + 25, y + 34);
        };

        addAddressBlock(margin + 2, addrY, {
          name: 'Edge Customs',
          address: 'B1, Shree Laxmi Welfare Society, Vaishali Nagar, Mumbai - 400068',
          phone: '(+91) 902 9999 651',
          email: 'info@edgecustoms.in',
          gst: '27EYCPK2819H1ZA'
        });

        addAddressBlock(pageWidth / 2 + 2, addrY, {
          name: job.customerName,
          address: '—',
          phone: job.customerPhone,
          email: '—',
          gst: '—'
        });

        currentY = addrY + 35;
      } else {
        currentY = margin;
      }

      // (Removed large watermark as requested)
    };

    const renderInvoiceDetails = () => {
      const detailBoxH = 20;
      drawLine(margin, currentY + detailBoxH, pageWidth - margin, currentY + detailBoxH);
      drawLine(margin + contentWidth * 0.4, currentY, margin + contentWidth * 0.4, currentY + detailBoxH);

      drawLine(margin + 20, currentY, margin + 20, currentY + detailBoxH);
      drawLine(margin, currentY + 5, margin + contentWidth * 0.4, currentY + 5);
      drawLine(margin, currentY + 10, margin + contentWidth * 0.4, currentY + 10);
      drawLine(margin, currentY + 15, margin + contentWidth * 0.4, currentY + 15);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Invoice No:', margin + 2, currentY + 3.8);
      doc.text('Invoice Date:', margin + 2, currentY + 8.8);
      doc.text('Vehicle Reg:', margin + 2, currentY + 13.8);
      doc.text('Vehicle Model:', margin + 2, currentY + 18.8);

      doc.setFont('helvetica', 'normal');
      const jobCardNo = job.id;
      doc.text(jobCardNo, margin + 22, currentY + 3.8);
      const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      doc.text(dateStr, margin + 22, currentY + 8.8);
      doc.text(job.registrationNumber || '—', margin + 22, currentY + 13.8);
      doc.text(`${job.carBrand} ${job.carModel}`, margin + 22, currentY + 18.8);

      drawLine(margin + contentWidth * 0.4, currentY + 7, pageWidth - margin, currentY + 7);
      doc.setFont('helvetica', 'bold');
      doc.text('Job Card Number:', margin + contentWidth * 0.7, currentY + 4.5, { align: 'right' });
      doc.text(jobCardNo, margin + contentWidth * 0.7 + 5, currentY + 4.5);

      doc.setFont('helvetica', 'bolditalic');
      doc.setFontSize(20);
      doc.text('DRIVEN BY DETAIL', margin + contentWidth * 0.7, currentY + 16, { align: 'center' });

      currentY += detailBoxH;
    };

    const renderTableHeader = () => {
      const tableHeaderH = 7;
      doc.setFillColor(60, 60, 60);
      doc.rect(margin, currentY, contentWidth, tableHeaderH, 'F');
      doc.setTextColor(255);
      doc.setFontSize(9);
      doc.text('Sr.', margin + 2, currentY + 4.8);
      doc.text('Description of Service', margin + 12, currentY + 4.8);
      doc.text('Unit Price', pageWidth - margin - 55, currentY + 4.8, { align: 'center' });
      doc.text('Qty', pageWidth - margin - 30, currentY + 4.8, { align: 'center' });
      doc.text('Total', pageWidth - margin - 10, currentY + 4.8, { align: 'center' });
      currentY += tableHeaderH;
      doc.setTextColor(0);
    };

    // ── Start PDF Generation ──
    let pageNum = 1;
    renderHeader(true, pageNum);
    renderInvoiceDetails();
    renderTableHeader();

    const rowHeight = 8;
    const footerNeededSpace = 110;

    const tableTop = currentY - 7;
    (job.selectedServices || []).forEach((svc, index) => {
      if (currentY + rowHeight > pageHeight - 15) {
        // Draw vertical lines for current full page
        drawLine(margin + 10, tableTop, margin + 10, currentY);
        drawLine(margin + 80, tableTop, margin + 80, currentY);
        drawLine(pageWidth - margin - 45, tableTop, pageWidth - margin - 45, currentY);
        drawLine(pageWidth - margin - 20, tableTop, pageWidth - margin - 20, currentY);

        doc.addPage();
        pageNum++;
        renderHeader(false, pageNum);
        renderTableHeader();
      }

      const yRow = currentY;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text((index + 1).toString(), margin + 5, yRow + 5, { align: 'center' });
      doc.text(svc.name, margin + 12, yRow + 5);
      doc.text(`${currency} ${svc.price.toLocaleString()}`, pageWidth - margin - 47, yRow + 5, { align: 'right' });
      doc.text('1.00', pageWidth - margin - 22, yRow + 5, { align: 'right' });
      doc.text(`${currency} ${svc.price.toLocaleString()}`, pageWidth - margin - 2, yRow + 5, { align: 'right' });

      drawLine(margin, yRow + rowHeight, pageWidth - margin, yRow + rowHeight);
      currentY += rowHeight;
    });

    // ── Table Completion & Footer Page Check ──
    const drawTableBorders = (tTop: number, tBottom: number) => {
      drawLine(margin, tTop, margin, tBottom);
      drawLine(pageWidth - margin, tTop, pageWidth - margin, tBottom);
      drawLine(margin + 10, tTop, margin + 10, tBottom);
      drawLine(margin + 80, tTop, margin + 80, tBottom);
      drawLine(pageWidth - margin - 45, tTop, pageWidth - margin - 45, tBottom);
      drawLine(pageWidth - margin - 20, tTop, pageWidth - margin - 20, tBottom);
      drawLine(margin, tBottom, pageWidth - margin, tBottom);
    };

    let tableTopOnCurrentPage = tableTop;

    // If footer doesn't fit, move to next page
    if (currentY + footerNeededSpace > pageHeight - margin) {
      drawTableBorders(tableTopOnCurrentPage, currentY); // Finish table on current page

      doc.addPage();
      pageNum++;
      renderHeader(false, pageNum);
      currentY = margin + 10;
      // Note: We don't draw a new table box on the footer page unless there were items.
      // Since the loop is finished, currentY is at the start of the content area.
    }

    // Final table extension (to maintain a minimum box size on pages with items)
    let tableBottom = currentY;
    if (currentY > tableTopOnCurrentPage) {
      tableBottom = Math.max(currentY, pageHeight - margin - footerNeededSpace - 10);
      drawTableBorders(tableTopOnCurrentPage, tableBottom);
    }

    const footerStartY = tableBottom + 5;

    // Totals
    const totalRowH = 7;
    const totalsX = pageWidth - margin - 60;
    const totalsW = 60;
    let totalY = footerStartY;

    const renderTotalRow = (label: string, value: string, isFinal = false) => {
      if (isFinal) {
        doc.setFillColor(235, 235, 235);
        doc.rect(totalsX, totalY, totalsW, totalRowH, 'F');
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      doc.setFontSize(9);
      doc.text(label, totalsX + 2, totalY + 4.5);
      doc.text(value, pageWidth - margin - 2, totalY + 4.5, { align: 'right' });
      drawLine(totalsX, totalY + totalRowH, pageWidth - margin, totalY + totalRowH);
      drawLine(totalsX, totalY, totalsX, totalY + totalRowH);
      totalY += totalRowH;
    };

    const grand = job.finalAmount || 0;
    const taxableTotal = Math.round(grand / 1.18);
    const totalTax = grand - taxableTotal;
    const cgst = Math.round(totalTax / 2);
    const sgst = totalTax - cgst;
    const sub = job.subtotal || 0;

    renderTotalRow('Sub Total (Incl. GST)', `${currency} ${sub.toLocaleString()}`);
    renderTotalRow('Discount', `${currency} ${job.discountAmount.toLocaleString()}`);
    renderTotalRow('Taxable Value', `${currency} ${taxableTotal.toLocaleString()}`, true);
    renderTotalRow('CGST (9%)', `${currency} ${cgst.toLocaleString()}`);
    renderTotalRow('SGST (9%)', `${currency} ${sgst.toLocaleString()}`);
    renderTotalRow('IGST (18%)', '—');
    renderTotalRow('GRAND TOTAL', `${currency} ${grand.toLocaleString()}`, true);

    // Brands
    const brandBoxW = contentWidth - 60;
    const brandBoxH = totalRowH * 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('BRANDS WE TRUST', margin + brandBoxW / 2, tableBottom + 4, { align: 'center' });

    try {
      const brandImgW = brandBoxW - 10;
      const brandImgH = brandImgW / 7.78;
      doc.addImage('/brands_strip.png', 'PNG', margin + 5, tableBottom + 12, brandImgW, brandImgH);
    } catch (e) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('XPEL | 3M | GTECHNIQ | LLUMAR | GARWARE | MENZERNA | SCHOLL', margin + brandBoxW / 2, tableBottom + (brandBoxH / 2) + 2, { align: 'center' });
    }

    currentY = totalY;

    // Amount in Words
    currentY += 5;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, currentY, contentWidth, 10, 'F');
    drawLine(margin, currentY, pageWidth - margin, currentY);
    drawLine(margin, currentY + 10, pageWidth - margin, currentY + 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in Words:', pageWidth / 2, currentY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(amountToWords(grand), pageWidth / 2, currentY + 8, { align: 'center' });

    // Thanks
    currentY += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, currentY, { align: 'center' });

    // Terms
    currentY += 8;
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(margin, currentY, contentWidth, 26);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin + 3, currentY + 5);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const terms = [
      '1. All coatings, PPF, wraps, and detailing services require proper aftercare as advised to maintain performance and warranty.',
      '2. The studio is not responsible for pre-existing paint defects, weak repaint areas, or hidden damage noticed during service.',
      '3. No warranty shall apply in case of damage caused by accidents, improper washing, harsh chemicals, or third-party work.',
      '4. Vehicle must be inspected by the customer at delivery; any concerns must be reported before leaving the studio.',
      '5. Service timelines may vary depending on vehicle condition, and the studio reserves the right to extend delivery if correction is required.'
    ];
    let ty = currentY + 10;
    terms.forEach(term => {
      const lines = doc.splitTextToSize(term, contentWidth - 6);
      doc.text(lines, margin + 3, ty);
      ty += (lines.length * 3.1);
    });

    doc.save(`Invoice-${job.id}.pdf`);
  }


  private renderPhotoGrid(doc: jsPDF, title: string, photos: string[]): void {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const gap = 6;
    const imgWidth = (pageWidth - margin * 2 - gap) / 2;
    const imgHeight = (imgWidth * 3) / 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, pageWidth / 2, margin + 5, { align: 'center' });
    doc.line(margin, margin + 8, pageWidth - margin, margin + 8);

    let cy = margin + 15;
    let cx = margin;

    photos.forEach((photo, idx) => {
      if (cy + imgHeight > pageHeight - 15) {
        doc.addPage();
        cy = margin + 10;
        cx = margin;
      }

      try {
        doc.addImage(photo, 'JPEG', cx, cy, imgWidth, imgHeight);
      } catch (e) {
        doc.rect(cx, cy, imgWidth, imgHeight);
      }

      if (idx % 2 === 0) {
        cx = margin + imgWidth + gap;
      } else {
        cx = margin;
        cy += imgHeight + gap;
      }
    });
  }

  generateWhatsAppMessage(job: JobCard): string {
    const services = job.selectedServices?.map(s => `• ${s.name}`).join('\n') || 'None';
    const vehicleLabel = (job.vehicleCategory === 'Bike') ? '🏍️' : '🚘';
    const vehicleTypeStr = (job.vehicleCategory && job.vehicleType) ? ` (${job.vehicleType})` : '';
    return encodeURIComponent(
      `🚗 *EDGE CUSTOMS - Job Card*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Job ID:* ${job.id}\n` +
      `📅 *Date:* ${new Date(job.createdAt).toLocaleDateString('en-IN')}\n\n` +
      `👤 *Customer:* ${job.customerName}\n` +
      `📞 *Phone:* ${job.customerPhone}\n\n` +
      `${vehicleLabel} *Vehicle:* ${job.carBrand} ${job.carModel}${vehicleTypeStr}\n` +
      `🔢 *Reg:* ${job.registrationNumber}\n\n` +
      `🔧 *Services:*\n${services}\n\n` +
      `💰 *Total:* ₹${(job.finalAmount || 0).toLocaleString()}\n` +
      `📊 *Status:* ${job.status}\n\n` +
      `_Edge Customs - Premium Car Detailing_`
    );
  }
}
