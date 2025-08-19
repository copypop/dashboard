import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

interface ExportOptions {
  fileName?: string;
  format: 'pdf' | 'html';
  title?: string;
  timestamp?: boolean;
}

/**
 * Export dashboard content as PDF
 */
export const exportToPDF = async (
  elementId: string,
  fileName: string = 'dashboard-export',
  title?: string
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = 'Generating PDF...';
    loadingDiv.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(loadingDiv);

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, 105, 15, { align: 'center' });
      position = 25;
    }

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    pdf.setFontSize(10);
    pdf.text(`Generated: ${timestamp}`, 105, position + 5, { align: 'center' });
    position += 15;

    // Add image to PDF (handle multi-page)
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);

    // Remove loading indicator
    document.body.removeChild(loadingDiv);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

/**
 * Export dashboard content as HTML
 */
export const exportToHTML = async (
  elementId: string,
  fileName: string = 'dashboard-export',
  title?: string
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Remove interactive elements from clone
    const buttons = clonedElement.querySelectorAll('button, select, input');
    buttons.forEach(btn => btn.remove());

    // Get all styles
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Handle cross-origin stylesheets
          return '';
        }
      })
      .join('\n');

    // Create HTML document
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Dashboard Export'}</title>
    <style>
        ${styles}
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f7f8fa;
        }
        .export-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .export-title {
            font-size: 24px;
            font-weight: 600;
            color: #005C84;
            margin-bottom: 10px;
        }
        .export-timestamp {
            font-size: 14px;
            color: #666;
        }
        .export-content {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        @media print {
            body {
                padding: 0;
                background: white;
            }
            .export-header {
                box-shadow: none;
                border-bottom: 2px solid #005C84;
                border-radius: 0;
            }
            .export-content {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="export-header">
        <img src="/caat-logo-en.svg" alt="CAAT" style="height: 40px; margin-bottom: 10px;">
        <div class="export-title">${title || 'Dashboard Export'}</div>
        <div class="export-timestamp">Generated: ${new Date().toLocaleString()}</div>
    </div>
    <div class="export-content">
        ${clonedElement.innerHTML}
    </div>
</body>
</html>`;

    // Create blob and save
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.html`);
  } catch (error) {
    console.error('Error generating HTML:', error);
    alert('Failed to generate HTML. Please try again.');
  }
};

/**
 * Export data as CSV
 */
export const exportToCSV = (
  data: any[],
  fileName: string = 'data-export',
  headers?: string[]
): void => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => {
          const value = row[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    // Create blob and save
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error generating CSV:', error);
    alert('Failed to generate CSV. Please try again.');
  }
};

/**
 * Generic export function
 */
export const exportDashboard = async (
  elementId: string,
  options: ExportOptions
): Promise<void> => {
  const { fileName = 'dashboard-export', format, title, timestamp = true } = options;
  
  const exportTitle = timestamp 
    ? `${title} - ${new Date().toLocaleDateString()}`
    : title;

  switch (format) {
    case 'pdf':
      await exportToPDF(elementId, fileName, exportTitle);
      break;
    case 'html':
      await exportToHTML(elementId, fileName, exportTitle);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};