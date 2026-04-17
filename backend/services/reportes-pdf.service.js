const PDFDocument = require('pdfkit');

function formatoFecha(valor) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '-';
  return fecha.toLocaleDateString('es-MX');
}

function texto(valor) {
  if (valor === null || valor === undefined || valor === '') return '-';
  return String(valor);
}

function generarPdf({ res, nombreArchivo, titulo, resumen, columnas, filas }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);

  doc.pipe(res);

  doc.fontSize(18).fillColor('#1f2937').text(titulo, { align: 'left' });
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor('#4b5563').text(`Fecha de generación: ${new Date().toLocaleString('es-MX')}`);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor('#111827').text('Resumen', { underline: true });
  doc.moveDown(0.4);

  Object.entries(resumen).forEach(([clave, valor]) => {
    const etiqueta = clave.replace(/_/g, ' ');
    doc.fontSize(10).fillColor('#111827').text(`${etiqueta}: ${texto(valor)}`);
  });

  doc.moveDown(0.8);
  doc.fontSize(12).fillColor('#111827').text('Detalle', { underline: true });
  doc.moveDown(0.4);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const rowHeight = 24;
  const headerYPadding = 6;
  const cellPadding = 4;
  const totalWeight = columnas.reduce((acc, c) => acc + (c.weight || 1), 0);

  const colWidths = columnas.map((c) => (pageWidth * (c.weight || 1)) / totalWeight);

  function dibujarEncabezadoTabla() {
    let x = doc.page.margins.left;
    const y = doc.y;

    doc.rect(x, y, pageWidth, rowHeight).fill('#e5e7eb');

    columnas.forEach((col, idx) => {
      const width = colWidths[idx];
      doc.fillColor('#111827')
        .fontSize(9)
        .text(col.label, x + cellPadding, y + headerYPadding, {
          width: width - cellPadding * 2,
          align: 'left',
        });
      doc.rect(x, y, width, rowHeight).stroke('#d1d5db');
      x += width;
    });

    doc.y = y + rowHeight;
  }

  function saltoSiNecesario() {
    const limite = doc.page.height - doc.page.margins.bottom - rowHeight;
    if (doc.y > limite) {
      doc.addPage();
      dibujarEncabezadoTabla();
    }
  }

  dibujarEncabezadoTabla();

  if (!filas.length) {
    doc.moveDown(0.5);
    doc.fillColor('#6b7280').fontSize(10).text('Sin registros para mostrar.');
  } else {
    filas.forEach((fila) => {
      saltoSiNecesario();

      let x = doc.page.margins.left;
      const y = doc.y;

      columnas.forEach((col, idx) => {
        const width = colWidths[idx];
        const valor = col.format ? col.format(fila[col.key], fila) : fila[col.key];

        doc.fillColor('#111827')
          .fontSize(9)
          .text(texto(valor), x + cellPadding, y + 6, {
            width: width - cellPadding * 2,
            ellipsis: true,
          });

        doc.rect(x, y, width, rowHeight).stroke('#e5e7eb');
        x += width;
      });

      doc.y = y + rowHeight;
    });
  }

  doc.end();
}

module.exports = {
  generarPdf,
  formatoFecha,
};
