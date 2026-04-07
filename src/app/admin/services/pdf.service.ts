import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { JobCard } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class PdfService {

  async generateJobCardPdf(job: JobCard): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── Header ──
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(173, 255, 47); // Green
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('EDGE CUSTOMS', margin, 18);

    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text('Premium Car Detailing & Protection Studio', margin, 26);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`Job Card: ${job.id}`, pageWidth - margin, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    const dateStr = new Date(job.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    doc.text(dateStr, pageWidth - margin, 26, { align: 'right' });

    y = 48;

    // ── Status Badge ──
    const statusColors: Record<string, [number, number, number]> = {
      'Received': [59, 130, 246],
      'In Progress': [245, 158, 11],
      'Completed': [34, 197, 94],
      'Delivered': [107, 114, 128]
    };
    const statusColor = statusColors[job.status] || [107, 114, 128];
    doc.setFillColor(...statusColor);
    doc.roundedRect(margin, y, 40, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(job.status, margin + 20, y + 5.5, { align: 'center' });

    y += 16;

    // ── Helper for section headers ──
    const sectionHeader = (title: string) => {
      doc.setFillColor(30, 30, 30);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setTextColor(173, 255, 47);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 4, y + 5.5);
      y += 12;
    };

    const addRow = (label: string, value: string) => {
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 4, y);
      doc.setTextColor(40, 40, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(value || '—', margin + 55, y);
      y += 6;
    };

    // ── Customer Details ──
    sectionHeader('CUSTOMER DETAILS');
    addRow('Name', job.customerName);
    addRow('Phone', job.customerPhone);
    y += 4;

    // ── Vehicle Details ──
    sectionHeader('VEHICLE DETAILS');
    addRow('Brand / Model', `${job.carBrand} ${job.carModel}`);
    addRow('Reg. Number', job.registrationNumber);
    addRow('Color', job.carColor);
    addRow('Odometer', job.odometerReading ? `${job.odometerReading.toLocaleString()} km` : '—');
    addRow('Fuel Level', `${job.fuelLevel}%`);
    y += 4;

    // ── Services ──
    sectionHeader('SERVICES');
    if (job.selectedServices && job.selectedServices.length > 0) {
      doc.setFontSize(8);
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'bold');
      doc.text('Service', margin + 4, y + 4);
      doc.text('Category', margin + 80, y + 4);
      doc.text('Price', pageWidth - margin - 4, y + 4, { align: 'right' });
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      for (const svc of job.selectedServices) {
        if (y > 260) {
          doc.addPage();
          y = margin;
        }
        doc.text(svc.name, margin + 4, y);
        doc.setTextColor(120, 120, 120);
        doc.text(svc.category, margin + 80, y);
        doc.setTextColor(40, 40, 40);
        doc.text(`₹${svc.price.toLocaleString()}`, pageWidth - margin - 4, y, { align: 'right' });
        y += 5.5;
      }
    }
    y += 4;

    // ── Pricing ──
    sectionHeader('PRICING');
    addRow('Subtotal', `₹${(job.subtotal || 0).toLocaleString()}`);
    if (job.discountAmount > 0) {
      addRow('Discount', `- ₹${job.discountAmount.toLocaleString()} (${job.discountType === 'percent' ? job.discountValue + '%' : 'Flat'})`);
    }
    doc.setFontSize(11);
    doc.setTextColor(173, 255, 47);
    doc.setFillColor(10, 10, 10);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin + 4, y + 7);
    doc.text(`₹${(job.finalAmount || 0).toLocaleString()}`, pageWidth - margin - 4, y + 7, { align: 'right' });
    y += 16;

    if (job.payment) {
      addRow('Payment Mode', job.payment.mode);
      addRow('Amount Paid', `₹${job.payment.amount.toLocaleString()}`);
      if (job.payment.transactionId) {
        addRow('Transaction ID', job.payment.transactionId);
      }
      y += 4;
    }

    // ── Remarks ──
    if (job.remarks) {
      if (y > 240) { doc.addPage(); y = margin; }
      sectionHeader('REMARKS');
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(job.remarks, contentWidth - 8);
      doc.text(lines, margin + 4, y);
      y += lines.length * 5 + 4;
    }


    // ── Footer ──
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.text('Edge Customs | Mumbai, Maharashtra | +91 9029999651 | info@edgecustoms.in', pageWidth / 2, footerY, { align: 'center' });

    // ── Save ──
    doc.save(`EdgeCustoms-${job.id}.pdf`);
  }

  generateWhatsAppMessage(job: JobCard): string {
    const services = job.selectedServices?.map(s => `• ${s.name}`).join('\n') || 'None';
    return encodeURIComponent(
      `🚗 *EDGE CUSTOMS - Job Card*\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Job ID:* ${job.id}\n` +
      `📅 *Date:* ${new Date(job.createdAt).toLocaleDateString('en-IN')}\n\n` +
      `👤 *Customer:* ${job.customerName}\n` +
      `📞 *Phone:* ${job.customerPhone}\n\n` +
      `🚘 *Vehicle:* ${job.carBrand} ${job.carModel}\n` +
      `🔢 *Reg:* ${job.registrationNumber}\n\n` +
      `🔧 *Services:*\n${services}\n\n` +
      `💰 *Total:* ₹${(job.finalAmount || 0).toLocaleString()}\n` +
      `📊 *Status:* ${job.status}\n\n` +
      `_Edge Customs - Premium Car Detailing_`
    );
  }
}
