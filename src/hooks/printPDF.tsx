export function printInspectionDetails(inspection: any) {
  if (!inspection) return;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Inspection #${inspection.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #2c3e50; }
        h1, h2, h3, h4 { color: #3b82f6; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { border: 1px solid #ddd; background: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        p { margin: 6px 0; }
        .status-good { background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
        .status-faulty { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 12px; font-weight: bold; }
        ul { padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Inspection #${inspection.id}</h1>

        <div class="section">
          <h2>Vehicle Info</h2>
          <div class="grid">
            <p><strong>Registration:</strong> ${inspection.vehicle?.registration_number || 'N/A'}</p>
            <p><strong>Make / Model:</strong> ${inspection.vehicle?.make || ''} ${inspection.vehicle?.model || ''}</p>
            <p><strong>VIN:</strong> ${inspection.vehicle?.vin_number || 'N/A'}</p>
            <p><strong>Engine No:</strong> ${inspection.vehicle?.engine_number || 'N/A'}</p>
            <p><strong>Colour:</strong> ${inspection.vehicle?.colour || 'N/A'}</p>
            <p><strong>Year:</strong> ${inspection.vehicle?.manufactured_year || 'N/A'}</p>
          </div>
        </div>

        <div class="section">
          <h2>Driver Info</h2>
          <div class="grid">
            <p><strong>Name:</strong> ${inspection.driver ? `${inspection.driver.first_name} ${inspection.driver.surname}` : 'N/A'}</p>
            <p><strong>License No:</strong> ${inspection.driver?.license_number || 'N/A'}</p>
            <p><strong>License Expiry:</strong> ${inspection.driver?.license_expiry_date || 'N/A'}</p>
            <p><strong>Cell:</strong> ${inspection.driver?.cell_number || 'N/A'}</p>
          </div>
        </div>

        <div class="section">
          <h2>Inspection Details</h2>
          <div class="grid">
            <p><strong>Odometer:</strong> ${inspection.odo_reading || 'N/A'}</p>
            <p><strong>Status:</strong> 
              <span class="${inspection.overall_status === 'Faulty' ? 'status-faulty' : 'status-good'}">${inspection.overall_status || 'N/A'}</span>
            </p>
            <p><strong>Category:</strong> ${inspection.category || 'N/A'}</p>
            <p><strong>Date:</strong> ${inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleString() : 'N/A'}</p>
          </div>

          <h3>Checklist</h3>
          ${Array.isArray(inspection.checklist) && inspection.checklist.length > 0
            ? inspection.checklist.map((section: any) => `
              <div style="margin-bottom: 15px;">
                <h4>${section.title}</h4>
                <ul>
                  ${section.items.map((item: any) => `
                    <li style="display:flex; justify-content:space-between;">
                      <span>${item.label} <em style="color:#6b7280;">(Cat ${item.category})</em></span>
                      <span style="font-weight:bold; color: ${item.status === 'Faulty' ? '#b91c1c' : '#047857'};">
                        ${item.status}
                      </span>
                    </li>
                  `).join('')}
                </ul>
              </div>`
            ).join('')
            : '<p><em>No checklist data available.</em></p>'
          }
        </div>
      </div>
    </body>
  </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  // Optionally close after printing:
  // setTimeout(() => printWindow.close(), 500);
}
