import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { JobCard } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  async generateInvoice(job: JobCard): Promise<void> {
    const templatePath = 'assets/EdgeCustomsDynamicInvoice.xlsx';
    
    try {
      const response = await fetch(templatePath);
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      
      const worksheet = workbook.getWorksheet('Main Invoice');
      if (!worksheet) {
        throw new Error('Worksheet "Main Invoice" not found in template');
      }

      // ── Customer & Job Details ──
      worksheet.getCell('E3').value = job.customerName;
      worksheet.getCell('E6').value = job.customerPhone;
      
      worksheet.getCell('C10').value = job.id; // Invoice No
      worksheet.getCell('F10').value = job.id; // Job Card No
      
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      worksheet.getCell('C11').value = today;
      worksheet.getCell('C12').value = job.registrationNumber || '—';
      worksheet.getCell('C13').value = `${job.carBrand} ${job.carModel}`;

      // ── Services Table ──
      const startRow = 17;
      const services = job.selectedServices || [];
      
      // Clear existing service rows in the template if any (rows 17 to around 35)
      for (let i = 17; i <= 39; i++) {
        worksheet.getCell(`A${i}`).value = null;
        worksheet.getCell(`B${i}`).value = null;
        worksheet.getCell(`D${i}`).value = null;
        worksheet.getCell(`F${i}`).value = null;
        worksheet.getCell(`H${i}`).value = null;
      }

      services.forEach((service, index) => {
        const currentRow = startRow + index;
        worksheet.getCell(`A${currentRow}`).value = index + 1;
        worksheet.getCell(`B${currentRow}`).value = service.name;
        worksheet.getCell(`D${currentRow}`).value = service.price;
        worksheet.getCell(`F${currentRow}`).value = 1;
        // The template has a formula for Column H, but since we cleared it, we set the value directly
        worksheet.getCell(`H${currentRow}`).value = service.price;
      });

      // ── Totals ──
      const grand = job.finalAmount || 0;
      const taxableTotal = Math.round(grand / 1.18);
      const totalTax = grand - taxableTotal;
      const cgst = Math.round(totalTax / 2);
      const sgst = totalTax - cgst;
      const sub = job.subtotal || 0;
      const discount = job.discountAmount || 0;

      // Map to cells identified in the latest template (v3)
      worksheet.getCell('H40').value = sub;
      worksheet.getCell('H41').value = discount;
      worksheet.getCell('H42').value = taxableTotal; // Final Total (Taxable)
      worksheet.getCell('H43').value = cgst;
      worksheet.getCell('H44').value = sgst;
      worksheet.getCell('H45').value = 0; // IGST
      worksheet.getCell('H46').value = grand; // Final Amount

      // Amount in Words
      const amountWords = this.amountToWords(grand);
      worksheet.getCell('B46').value = `Amount in Words: ${amountWords}`;

      // ── Generate & Download Excel ──
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Invoice-${job.id}.xlsx`);

    } catch (error) {
      console.error('Error generating Excel invoice:', error);
      alert('Failed to generate Excel invoice. Please check the console for details.');
    }
  }

  private amountToWords(num: number): string {
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
  }
}
