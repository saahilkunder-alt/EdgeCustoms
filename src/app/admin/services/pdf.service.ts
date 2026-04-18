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
    let y = margin;

    // ── Helper: Draw Grid Line ──
    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      doc.setDrawColor(0);
      doc.setLineWidth(0.3);
      doc.line(x1, y1, x2, y2);
    };

    // ── Helper: Amount to Words ──
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

    // ── Outer Border (Starts after Addresses) ──
    const addressHeight = 35;
    const headerHeight = 25;
    const boxStartY = margin + headerHeight + addressHeight;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, boxStartY, contentWidth, (pageHeight - margin) - boxStartY);

    // ── Header Section (Outside Box) ──
    drawLine(margin, margin + headerHeight, pageWidth - margin, margin + headerHeight);

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(32);
    doc.text('Tax Invoice', margin + 10, margin + 17);

    // Header Right (Company Name & Logo)
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

    y = margin + headerHeight;

    // ── Invoice From / To (Outside Box) ──
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 6, 'F');
    drawLine(margin, y, margin, y + addressHeight); // Left border
    drawLine(pageWidth - margin, y, pageWidth - margin, y + addressHeight); // Right border
    drawLine(margin, y + 6, pageWidth - margin, y + 6);
    drawLine(margin, y + addressHeight, pageWidth - margin, y + addressHeight);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Invoice From:', margin + contentWidth / 4, y + 4.2, { align: 'center' });
    doc.text('Invoice To:', margin + (3 * contentWidth) / 4, y + 4.2, { align: 'center' });

    y += 10;
    const addAddressBlock = (x: number, data: any) => {
      doc.setFont('helvetica', 'bold');
      doc.text('Name:', x, y);
      doc.text('Address:', x, y + 5);
      doc.text('Phone:', x, y + 14);
      doc.text('Email Id:', x, y + 19);
      doc.text('GST No:', x, y + 24);

      doc.setFont('helvetica', 'normal');
      doc.text(data.name || '—', x + 25, y);
      const addrLines = doc.splitTextToSize(data.address || '—', (contentWidth / 2) - 30);
      doc.text(addrLines, x + 25, y + 5);
      doc.text(data.phone || '—', x + 25, y + 14);
      doc.text(data.email || '—', x + 25, y + 19);
      doc.text(data.gst || '—', x + 25, y + 24);
    };

    addAddressBlock(margin + 2, {
      name: 'Edge Customs',
      address: 'B1, Shree Laxmi Welfare Society, Vaishali Nagar, Mumbai - 400068',
      phone: '(+91) 902 9999 651',
      email: 'info@edgecustoms.in',
      gst: '27EYCPK2819H1ZA'
    });

    addAddressBlock(pageWidth / 2 + 2, {
      name: job.customerName,
      address: '—',
      phone: job.customerPhone,
      email: '—',
      gst: '—'
    });

    y = boxStartY;

    // ── Invoice Details ──
    const detailBoxH = 20;
    drawLine(margin, y + detailBoxH, pageWidth - margin, y + detailBoxH);
    drawLine(margin + contentWidth * 0.4, y, margin + contentWidth * 0.4, y + detailBoxH);

    // Left Grid
    drawLine(margin + 20, y, margin + 20, y + detailBoxH);
    drawLine(margin, y + 5, margin + contentWidth * 0.4, y + 5);
    drawLine(margin, y + 10, margin + contentWidth * 0.4, y + 10);
    drawLine(margin, y + 15, margin + contentWidth * 0.4, y + 15);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', margin + 2, y + 3.8);
    doc.text('Invoice Date:', margin + 2, y + 8.8);
    doc.text('Vehicle Reg:', margin + 2, y + 13.8);
    doc.text('Vehicle Model:', margin + 2, y + 18.8);

    doc.setFont('helvetica', 'normal');
    const jobShortId = job.id.split('-').pop() || '1';
    doc.text(jobShortId, margin + 22, y + 3.8);
    const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(dateStr, margin + 22, y + 8.8);
    doc.text(job.registrationNumber || '—', margin + 22, y + 13.8);
    doc.text(`${job.carBrand} ${job.carModel}`, margin + 22, y + 18.8);

    // Right Slogan
    drawLine(margin + contentWidth * 0.4, y + 7, pageWidth - margin, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Card Number:', margin + contentWidth * 0.7, y + 4.5, { align: 'right' });
    doc.text(jobShortId, margin + contentWidth * 0.7 + 5, y + 4.5);

    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(20);
    doc.text('DRIVEN BY DETAIL', margin + contentWidth * 0.7, y + 16, { align: 'center' });

    y += detailBoxH;

    // ── Table ──
    const tableHeaderH = 7;
    doc.setFillColor(60, 60, 60);
    doc.rect(margin, y, contentWidth, tableHeaderH, 'F');
    doc.setTextColor(255);
    doc.setFontSize(9);
    doc.text('Sr.', margin + 2, y + 4.8);
    doc.text('Description of Service', margin + 12, y + 4.8);
    doc.text('Unit Price', pageWidth - margin - 55, y + 4.8, { align: 'center' });
    doc.text('Qty', pageWidth - margin - 30, y + 4.8, { align: 'center' });
    doc.text('Total', pageWidth - margin - 10, y + 4.8, { align: 'center' });

    y += tableHeaderH;
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');

    // Vertical lines for table
    const tableBottom = y + 70;
    drawLine(margin + 10, y - tableHeaderH, margin + 10, tableBottom);
    drawLine(margin + 80, y - tableHeaderH, margin + 80, tableBottom);
    drawLine(pageWidth - margin - 45, y - tableHeaderH, pageWidth - margin - 45, tableBottom);
    drawLine(pageWidth - margin - 20, y - tableHeaderH, pageWidth - margin - 20, tableBottom);
    drawLine(margin, tableBottom, pageWidth - margin, tableBottom);

    let rowY = y;
    (job.selectedServices || []).forEach((svc, index) => {
      doc.text((index + 1).toString(), margin + 5, rowY + 5, { align: 'center' });
      doc.text(svc.name, margin + 12, rowY + 5);
      doc.text(`${currency} ${svc.price.toLocaleString()}`, pageWidth - margin - 47, rowY + 5, { align: 'right' });
      doc.text('1.00', pageWidth - margin - 22, rowY + 5, { align: 'right' });
      doc.text(`${currency} ${svc.price.toLocaleString()}`, pageWidth - margin - 2, rowY + 5, { align: 'right' });
      drawLine(margin, rowY + 8, pageWidth - margin, rowY + 8);
      rowY += 8;
    });

    // Watermark
    doc.setFontSize(60);
    doc.setTextColor(240, 240, 240);
    doc.text('Page 1', pageWidth / 2, tableBottom - 25, { align: 'center' });
    doc.setTextColor(0);

    y = tableBottom;

    // ── Right Bottom: Uniform Totals ──
    const totalRowH = 7;
    const totalsX = pageWidth - margin - 60;
    const totalsW = 60;

    // Vertical divider line (7 rows * 7mm = 49mm)
    drawLine(totalsX, y, totalsX, y + 49);

    const renderTotalRow = (label: string, value: string, isFinal = false) => {
      if (isFinal) {
        doc.setFillColor(235, 235, 235);
        doc.rect(totalsX, y, totalsW, totalRowH, 'F');
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      doc.setFontSize(9);
      doc.text(label, totalsX + 2, y + 4.5);
      doc.text(value, pageWidth - margin - 2, y + 4.5, { align: 'right' });
      drawLine(totalsX, y + totalRowH, pageWidth - margin, y + totalRowH);
      y += totalRowH;
    };

    // ── Left Bottom: High-Quality Brands Box ──
    const brandBoxW = contentWidth - 60;
    const brandBoxH = 49;
    const brandCenterYFooter = tableBottom + (brandBoxH / 2);

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
      doc.text('XPEL | 3M | GTECHNIQ | LLUMAR | GARWARE | MENZERNA | SCHOLL', margin + brandBoxW / 2, brandCenterYFooter + 2, { align: 'center' });
    }
    const sub = job.subtotal || 0;
    const final = job.finalAmount || 0;
    const cgst = Math.round(final * 0.09);
    const sgst = Math.round(final * 0.09);
    const grand = final + cgst + sgst;

    // Reset y for totals to match tableBottom
    y = tableBottom;
    renderTotalRow('Sub Total', `${currency} ${sub.toLocaleString()}`);
    renderTotalRow('Discount', `${currency} ${job.discountAmount.toLocaleString()}`);
    renderTotalRow('Net Total', `${currency} ${final.toLocaleString()}`, true);
    renderTotalRow('CGST (9%)', `${currency} ${cgst.toLocaleString()}`);
    renderTotalRow('SGST (9%)', `${currency} ${sgst.toLocaleString()}`);
    renderTotalRow('IGST (18%)', '—');
    renderTotalRow('GRAND TOTAL', `${currency} ${grand.toLocaleString()}`, true);

    // ── Amount in Words ──
    y += 5;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 10, 'F');
    drawLine(margin, y, pageWidth - margin, y);
    drawLine(margin, y + 10, pageWidth - margin, y + 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in Words:', pageWidth / 2, y + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(amountToWords(grand), pageWidth / 2, y + 8, { align: 'center' });

    y += 18;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, y, { align: 'center' });

    // ── Terms & Conditions ──
    y += 10;
    doc.setDrawColor(200);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, contentWidth, 28);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', margin + 3, y + 5);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const terms = [
      '1. All coatings, PPF, wraps, and detailing services require proper aftercare as advised to maintain performance and warranty.',
      '2. The studio is not responsible for pre-existing paint defects, weak repaint areas, or hidden damage noticed during service.',
      '3. No warranty shall apply in case of damage caused by accidents, improper washing, harsh chemicals, or third-party work.',
      '4. Vehicle must be inspected by the customer at delivery; any concerns must be reported before leaving the studio.',
      '5. Service timelines may vary depending on vehicle condition, and the studio reserves the right to extend delivery if additional correction is required.'
    ];
    
    let ty = y + 10;
    terms.forEach(term => {
      const lines = doc.splitTextToSize(term, contentWidth - 6);
      doc.text(lines, margin + 3, ty);
      ty += (lines.length * 3.5);
    });

    // ── Document Pages (Photos) ──
    this.appendDocumentationPages(doc, job);

    doc.save(`Invoice-${jobShortId}.pdf`);
  }

  private appendDocumentationPages(doc: jsPDF, job: JobCard): void {
    if (job.beforePhotos?.length > 0) {
      this.renderPhotoGrid(doc, 'PRE-SERVICE INSPECTION (BEFORE)', job.beforePhotos);
    }
    if (job.afterPhotos?.length > 0) {
      this.renderPhotoGrid(doc, 'POST-SERVICE COMPLETION (AFTER)', job.afterPhotos);
    }
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
