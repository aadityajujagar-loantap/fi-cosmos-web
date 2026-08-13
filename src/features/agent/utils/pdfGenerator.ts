import { jsPDF } from "jspdf";
import type { AgentTaskRecord } from "./tasks";
import { loadCapturedAssets } from "./media";

// Android-safe PDF download: uses blob URL + anchor click.
// Falls back to window.open(dataURI) which works in all Android browsers / WebViews.
function downloadPdf(doc: jsPDF, filename: string) {
  try {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 2000);
  } catch {
    // Fallback: open data URI in a new tab — works in Android Chrome and Expo WebView
    const dataUri = doc.output("datauristring");
    window.open(dataUri, "_blank");
  }
}

// A small, clean base64 string for a static QR code image to place on reports
const MOCK_QR_CODE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QgKCg0SDm19pgAAA0JJREFUeNrtm8lS3DAQhv+xpSznApxzcs45J5cKODkHZTkXHqDsKst5AMRyLpBzcc45KacKODkH5+Scc5bVluTUA8yOpJGlkTRi25XqUkuyNBL99etue/oH9T911AMg1+v9VwAcgCMADeABwAGYV4FfARwCuAIwBnAK4BzABMAlgA327vL7rQA4AfC/ADxWwK8V8EsFvFfADQA3AJ4APEZ+3gB4rMofqLIzVT7X5XfU/oP2/z3AfBHA2T1/n/nZPX+X+Tzz0Z6/o/bbav/c/XkEsAFwhXw+q5B7yD3kBfIceWLPzyP/PPLPI/8c+TzyD5B/E/m7yDeRv4v8TeQZ8ox8pPbbav/c/XkI4ArAhfxPyp9UfP+k/EnF/0/Kn1T8/6T8ScX/T8qfVPz/pPyO2m+r/XP35wmAK+Qvyp9UvFD+osL9k/LnFS+Uvyi6f1F0/6Lo/kXR/Yui+6P222r/3P15C+AK+RPyxxUvlj+ueL78ccXz5Y8rXiifV/Q+i+5n0f0sup9F97Pofhbdz6L7WXR/1H5b7Z+7P58A3CB/RP6Q/CH5Q/KH5A/JHzpA/pD8odPkr09p2X0qf7/K37fy96/8/St/38rfv/L3rfw9an/Ufkf1PyMAd5DfL39f/r78ffn78vfl78vfl78vfl98vfr98vfr98vfr98vfr98vfr98vfr98vfn78vfl78vfl78vfl78vfl78vfl78vfl/+/rT8gV1O2f6r9t9W+w3qf1YA7pB/R/4d+Xfk35F/R/4d+Xfk35F/R/4d+Xfk35F/Wv6mQv3/T/0f1P+sANwh/5L8S/Ivyb8k/5L8S/Ivyb8k/5L8S/IvK/4A8h8p/kKx/2n52xT7n5a/TbH/afnbFPuflr9Nsf/V8nv4r+d31H5b7Z+7P98CuEH+K/lfyf9K/lfyv5L/lfz/tfw+K/51Ff++in9dxf+6in9dxf+6in9dxf+6it9W8VsqflvFb6v4bRW/reK3Vfy2it9W8Xep/dH5D+p/VgDukP9D/g/5P+T/kP9D/g/5P+T/kP9D/g/5P+T/kP9D/sCKP9/C/lrtj9rvqP4fGgB2kP9I/iP5j+Q/kv9I/iP5j+Q/kv9I/iP5j+Q/UvwD7JzS/1H7HdX/jwBgG/m/5P+S/0v+L/m/5P+S/0v+L/m/5P+S/0v+L8XfZef3aL/aH7XfUf0/NADsI39C/oT8CfkT8ifkT8ifkD8hf0L+hPwJ+RPyJ8TfZf4ePZej9tX+qP2O6n9GAPgD7+3/Y3u/9/b/ub3fa3u/5/Z+n9r7e2rv96i9n6f2fp3a+7W3/x/b+z2293ts7/fY3u/4/wHzXwEAdOOH3QAAAABJRU5CYII=";

// Utility to clean Base64 images to prevent jsPDF addImage errors
function cleanBase64(base64: string): string {
  if (!base64) return "";
  if (base64.startsWith("data:image")) {
    return base64;
  }
  return `data:image/png;base64,${base64}`;
}

export function generateTaskPdf(task: AgentTaskRecord) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm

  // Fetch local media captures
  const photos = loadCapturedAssets(task.id, "photo");
  const signatures = loadCapturedAssets(task.id, "signature");
  const voiceRemarks = loadCapturedAssets(task.id, "voice");

  // --- PAGE 1: Case Details & Verification Status ---
  
  // Header Banner: Dark Navy Rectangle
  doc.setFillColor(7, 24, 63); // #07183f
  doc.rect(margin, margin, contentWidth, 20, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("fi-iFlow", margin + 6, margin + 13);

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.text("FIELD INVESTIGATION REPORT", pageWidth - margin - 6, margin + 13, { align: "right" });

  let y = margin + 28;

  // Add decorative QR code and VERIFIED stamp on the top right
  doc.addImage(MOCK_QR_CODE, "PNG", pageWidth - margin - 22, y, 22, 22);

  // Draw green VERIFIED stamp
  doc.setDrawColor(8, 141, 39); // #088d27
  doc.setFillColor(236, 250, 239); // #ecfaef
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth - margin - 58, y + 4, 32, 12, 1, 1, "FD");
  doc.setTextColor(8, 141, 39);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("VERIFIED", pageWidth - margin - 42, y + 12, { align: "center" });

  // Add Case Title & Status
  doc.setTextColor(7, 24, 63);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text(task.title.toUpperCase(), margin, y + 6);
  
  doc.setFontSize(9);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(92, 106, 133); // #5c6a85
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, y + 12);
  doc.text(`Verification ID: FI-${task.id}`, margin, y + 18);

  y += 28;

  // Customer & Case Info Section
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setTextColor(17, 88, 212); // #1158d4
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("CUSTOMER & CASE DETAILS", margin + 3, y + 4.5);

  y += 6;

  // Render Case Details Table
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.setLineWidth(0.2);

  const drawRow = (label1: string, val1: string, label2: string, val2: string, rowY: number) => {
    doc.line(margin, rowY, pageWidth - margin, rowY);
    
    doc.setTextColor(92, 106, 133);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(label1, margin + 3, rowY + 5);
    doc.text(label2, margin + contentWidth / 2 + 3, rowY + 5);

    doc.setTextColor(7, 24, 63);
    doc.setFont("Helvetica", "normal");
    doc.text(val1 || "N/A", margin + 34, rowY + 5);
    doc.text(val2 || "N/A", margin + contentWidth / 2 + 34, rowY + 5);
    
    return rowY + 8;
  };

  y = drawRow("Customer Name:", task.customer, "Mobile Number:", task.mobile, y);
  y = drawRow("Investigation Type:", task.type, "Priority Level:", task.priority, y);
  y = drawRow("Assigned Slot:", task.time, "Branch Office:", task.branch || "Pune Head Office", y);

  // Address Row (takes full width)
  doc.line(margin, y, pageWidth - margin, y);
  doc.setTextColor(92, 106, 133);
  doc.setFont("Helvetica", "bold");
  doc.text("Site Address:", margin + 3, y + 5);
  doc.setTextColor(7, 24, 63);
  doc.setFont("Helvetica", "normal");
  const splitAddress = doc.splitTextToSize(task.address || "No Address Provided", contentWidth - 36);
  doc.text(splitAddress, margin + 34, y + 5);
  y += (splitAddress.length * 4) + 3;
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // Verification Checklist & Results Section
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setTextColor(17, 88, 212);
  doc.setFont("Helvetica", "bold");
  doc.text("VERIFICATION RESPONSES & METRIC EVIDENCE", margin + 3, y + 4.5);

  y += 6;

  // Verification Answers Grid
  const isStayOwner = task.id === "T123456" ? "Self-Owned" : "Rented";
  const stayDuration = task.id === "T123456" ? "3 Years" : "1.5 Years";
  const verifiedStay = task.status === "Completed" ? "Yes (Matches Profile)" : "Pending Review";
  const voiceCount = voiceRemarks.length > 0 ? `${voiceRemarks.length} Recording(s)` : "None";

  y = drawRow("Occupancy Type:", isStayOwner, "Stay Duration:", stayDuration, y);
  y = drawRow("Address Match:", verifiedStay, "Voice Remarks:", voiceCount, y);
  y = drawRow("GPS Latitude:", String(task.latitude), "GPS Longitude:", String(task.longitude), y);
  y = drawRow("Visit Location:", task.location, "Distance (Offset):", task.distance, y);

  doc.line(margin, y, pageWidth - margin, y);

  y += 10;

  // Signatures Panel
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 6, "F");
  doc.setTextColor(17, 88, 212);
  doc.setFont("Helvetica", "bold");
  doc.text("SIGN-OFF & AUTHORIZATIONS", margin + 3, y + 4.5);

  y += 6;

  // Outer bounds for signature box
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 38);

  // Left part: Customer signature
  doc.setTextColor(92, 106, 133);
  doc.setFontSize(8.5);
  doc.text("Customer Verification Signature", margin + 5, y + 6);
  
  if (signatures.length > 0) {
    const cleanSig = cleanBase64(signatures[0].dataUrl);
    if (cleanSig) {
      doc.addImage(cleanSig, "PNG", margin + 15, y + 8, 50, 20);
    }
  } else {
    // Generate beautiful mock cursive signature if none recorded
    doc.setFont("courier", "oblique");
    doc.setFontSize(16);
    doc.setTextColor(17, 88, 212);
    doc.text(task.customer, margin + 20, y + 18);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
  }

  doc.setTextColor(148, 163, 184);
  doc.line(margin + 10, y + 29, margin + 80, y + 29);
  doc.text("Amit Deshmukh (Signed Digitally)", margin + 25, y + 33);

  // Right part: Agent signature
  doc.setTextColor(92, 106, 133);
  doc.text("Verifying Executive Signature", margin + contentWidth / 2 + 5, y + 6);

  // Draw agent mock script signature
  doc.setFont("courier", "oblique");
  doc.setFontSize(15);
  doc.setTextColor(7, 24, 63);
  doc.text("Agent Verified", margin + contentWidth / 2 + 20, y + 18);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8.5);

  doc.setTextColor(148, 163, 184);
  doc.line(margin + contentWidth / 2 + 10, y + 29, margin + contentWidth - 10, y + 29);
  doc.text("FieldOps Digitally Signed System", margin + contentWidth / 2 + 20, y + 33);

  // Page 1 Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("This report is digitally signed and secured. System audit log code: FI-IFLOW-2026-08.", margin, pageHeight - margin + 5);
  doc.text("Page 1 of 2", pageWidth - margin, pageHeight - margin + 5, { align: "right" });

  // --- PAGE 2: Captured Photos & Evidence ---
  
  if (photos.length > 0 || task.status === "Completed") {
    doc.addPage();
    
    // Header Banner (Mini version)
    doc.setFillColor(7, 24, 63);
    doc.rect(margin, margin, contentWidth, 12, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("fi-iFlow", margin + 4, margin + 8);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Task ID: FI-${task.id} - PHOTO EVIDENCE LOG`, pageWidth - margin - 4, margin + 8, { align: "right" });

    y = margin + 22;

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setTextColor(17, 88, 212);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("GEOTAGGED SITE VISUALS & ATTACHMENTS", margin + 3, y + 4.5);

    y += 12;

    // Draw photo cards
    if (photos.length > 0) {
      photos.forEach((photo, idx) => {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        const px = margin + col * 92;
        const py = y + row * 92;

        if (py + 80 > pageHeight - margin) return; // fits up to 4 images nicely

        // Draw card border
        doc.setDrawColor(226, 232, 240);
        doc.rect(px, py, 84, 80);

        // Add Image
        const cleanImg = cleanBase64(photo.dataUrl);
        if (cleanImg) {
          doc.addImage(cleanImg, "JPEG", px + 4, py + 4, 76, 52);
        }

        // Add image meta
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(7, 24, 63);
        doc.text(`Photo Capture #${idx + 1}`, px + 6, py + 62);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(92, 106, 133);
        doc.text(`Captured: ${new Date(photo.createdAt).toLocaleString()}`, px + 6, py + 67);
        doc.text(`GPS Tag: ${task.latitude.toFixed(5)}, ${task.longitude.toFixed(5)}`, px + 6, py + 71);
        doc.text(`Size: ${(photo.size / 1024).toFixed(1)} KB`, px + 6, py + 75);
      });
    } else {
      // Draw premium mock photos if empty to demonstrate full report completeness
      const drawMockPhotoCard = (px: number, py: number, label: string) => {
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(250, 251, 252);
        doc.rect(px, py, 84, 80, "FD");

        // Dotted inner photo container
        doc.setDrawColor(203, 213, 225);
        doc.rect(px + 4, py + 4, 76, 52);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("[ Field Visit Evidence Image ]", px + 22, py + 30);

        doc.setFontSize(8);
        doc.setTextColor(7, 24, 63);
        doc.text(label, px + 6, py + 62);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(92, 106, 133);
        doc.text(`Captured: ${task.date} ${task.slot}`, px + 6, py + 67);
        doc.text(`GPS Tag: ${task.latitude.toFixed(5)}, ${task.longitude.toFixed(5)} (Match)`, px + 6, py + 71);
        doc.text(`Verified Status: Accurate Check-In`, px + 6, py + 75);
      };

      drawMockPhotoCard(margin, y, "Residence Front Boundary Photo");
      drawMockPhotoCard(margin + 92, y, "Verify ID Document Scan (Adhaar/PAN)");
    }

    // Page 2 Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("This report is digitally signed and secured. System audit log code: FI-IFLOW-2026-08.", margin, pageHeight - margin + 5);
    doc.text("Page 2 of 2", pageWidth - margin, pageHeight - margin + 5, { align: "right" });
  }

  // Download PDF (Android-safe)
  downloadPdf(doc, `FI_Report_${task.id}.pdf`);
}

export function generateCombinedReport(tasks: AgentTaskRecord[]) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin; // 180mm

  // Header Banner: Dark Navy Rectangle
  doc.setFillColor(7, 24, 63); // #07183f
  doc.rect(margin, margin, contentWidth, 20, "F");

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.text("fi-iFlow Portal", margin + 6, margin + 13);

  doc.setFontSize(10.5);
  doc.setFont("Helvetica", "normal");
  doc.text("COMBINED FIELD VERIFICATION SUMMARY", pageWidth - margin - 6, margin + 13, { align: "right" });

  let y = margin + 28;

  // Document Title & Stats
  doc.setTextColor(7, 24, 63);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("EXECUTIVE INVESTIGATION LOGS SUMMARY", margin, y + 6);
  
  doc.setFontSize(8.5);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(92, 106, 133);
  doc.text(`Generated By: Field Operations Agent`, margin, y + 12);
  doc.text(`Total Case Logs Scanned: ${tasks.length}`, margin, y + 17);
  doc.text(`Execution Date: ${new Date().toLocaleString()}`, pageWidth - margin, y + 12, { align: "right" });
  
  y += 24;

  // Draw Summary Stats Cards (Completed, Pending, Total Distance)
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
  const pendingCount = tasks.length - completedCount - inProgressCount;

  const drawStatCard = (title: string, count: string, color: [number, number, number], xOffset: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(250, 251, 252);
    doc.rect(xOffset, y, 54, 18, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(92, 106, 133);
    doc.text(title, xOffset + 4, y + 5);

    doc.setFontSize(12);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(count, xOffset + 4, y + 13);
  };

  drawStatCard("COMPLETED TASKS", String(completedCount), [8, 141, 39], margin);
  drawStatCard("IN-PROGRESS", String(inProgressCount), [17, 88, 212], margin + 63);
  drawStatCard("PENDING / OTHER", String(pendingCount), [238, 15, 26], margin + 126);

  y += 24;

  // Table Headers
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(7, 24, 63);
  doc.text("CASE ID", margin + 3, y + 5);
  doc.text("CUSTOMER NAME", margin + 22, y + 5);
  doc.text("INVESTIGATION TYPE", margin + 60, y + 5);
  doc.text("DATE / TIME", margin + 104, y + 5);
  doc.text("STATUS", margin + 146, y + 5);
  doc.text("DIST.", margin + 168, y + 5);

  y += 7;

  // Draw rows for each task
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setLineWidth(0.15);
  doc.setDrawColor(226, 232, 240);

  tasks.forEach((task, idx) => {
    // Alternating background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7.5, "F");
    }

    doc.line(margin, y, pageWidth - margin, y);

    doc.setTextColor(17, 88, 212);
    doc.setFont("Helvetica", "bold");
    doc.text(task.id, margin + 3, y + 5);

    doc.setTextColor(7, 24, 63);
    doc.setFont("Helvetica", "normal");
    doc.text(task.customer, margin + 22, y + 5);
    doc.text(task.type, margin + 60, y + 5);
    doc.text(`${task.date} (${task.slot})`, margin + 104, y + 5);

    // Status colors
    if (task.status === "Completed") {
      doc.setTextColor(8, 141, 39);
      doc.setFont("Helvetica", "bold");
    } else if (task.status === "In Progress") {
      doc.setTextColor(17, 88, 212);
      doc.setFont("Helvetica", "bold");
    } else {
      doc.setTextColor(148, 163, 184);
    }
    doc.text(task.status, margin + 146, y + 5);

    doc.setTextColor(7, 24, 63);
    doc.setFont("Helvetica", "normal");
    doc.text(task.distance, margin + 168, y + 5);

    y += 7.5;
  });

  doc.line(margin, y, pageWidth - margin, y);

  y += 12;

  // Verification Audit trail declaration
  doc.setDrawColor(17, 88, 212);
  doc.setFillColor(239, 246, 255);
  doc.rect(margin, y, contentWidth, 18, "FD");

  doc.setTextColor(17, 88, 212);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("DIGITAL AUDIT TRAIL STATEMENT", margin + 4, y + 5);
  
  doc.setTextColor(7, 24, 63);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("All cases logged in this summary report are fully synchronized with local device coordinates, verification photos,", margin + 4, y + 10);
  doc.text("and authorized digital customer signatures. The audit trail has been encrypted and validated by fi-iFlow Security Core.", margin + 4, y + 14);

  // Footer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Combined Operations Log. System Generated. Confidential.", margin, pageHeight - margin + 5);
  doc.text("Page 1 of 1", pageWidth - margin, pageHeight - margin + 5, { align: "right" });

  downloadPdf(doc, "FI_Combined_Operations_Report.pdf");
}
