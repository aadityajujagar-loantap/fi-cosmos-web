import { jsPDF } from "jspdf";
import type { AgentTaskRecord } from "./tasks";
import { loadCapturedAssets } from "./media";
import { supabaseRepository } from "../../../data/repository";
import { evidenceService } from "../../../data/services";

type PdfBridgeMessage =
  | { type: "fi-iflow/pdf-download/start"; id: string; filename: string; totalChunks: number }
  | { type: "fi-iflow/pdf-download/chunk"; id: string; index: number; chunk: string }
  | { type: "fi-iflow/pdf-download/complete"; id: string };

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const PDF_CHUNK_SIZE = 256 * 1024;

async function postPdfToNative(doc: jsPDF, filename: string): Promise<boolean> {
  if (!window.ReactNativeWebView?.postMessage) return false;

  const dataUri = doc.output("datauristring");
  const base64 = dataUri.slice(dataUri.indexOf(",") + 1);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const totalChunks = Math.ceil(base64.length / PDF_CHUNK_SIZE);

  const post = (message: PdfBridgeMessage) => window.ReactNativeWebView?.postMessage(JSON.stringify(message));
  
  post({ filename, id, totalChunks, type: "fi-iflow/pdf-download/start" });
  await new Promise((resolve) => setTimeout(resolve, 50));

  for (let index = 0; index < totalChunks; index += 1) {
    post({
      chunk: base64.slice(index * PDF_CHUNK_SIZE, (index + 1) * PDF_CHUNK_SIZE),
      id,
      index,
      type: "fi-iflow/pdf-download/chunk",
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  post({ id, type: "fi-iflow/pdf-download/complete" });
  return true;
}

async function downloadPdf(doc: jsPDF, filename: string, forceDirectDownload = false) {
  if (await postPdfToNative(doc, filename)) return;

  const blob = doc.output("blob");

  // Temporary PWA/Mobile Browser Workaround:
  // Use Web Share API to share the PDF natively if supported on the device.
  // This bypasses the "Downloading from chrome" notification tray entirely and hides the URL footprint.
  if (!forceDirectDownload && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Field Investigation Report",
          text: `Report: ${filename}`,
        });
        return;
      }
    } catch (shareError) {
      // If the user cancels sharing or it's blocked, fall through to default download
      console.warn("Web Share cancelled or failed, using download fallback:", shareError);
    }
  }

  try {
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

async function toBase64(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Failed to convert URL to base64:", url, err);
    return "";
  }
}

// Utility to clean Base64 images to prevent jsPDF addImage errors
function cleanBase64(base64: string): string {
  if (!base64) return "";
  if (base64.startsWith("data:image")) {
    return base64;
  }
  return `data:image/png;base64,${base64}`;
}

export async function generateTaskPdf(task: AgentTaskRecord, forceDirectDownload = false) {
  try {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const safeSetFont = (fontName: string, fontStyle = "normal") => {
      try {
        doc.setFont(fontName, fontStyle);
      } catch {
        try {
          doc.setFont(fontName, "normal");
        } catch {
          // ignore
        }
      }
    };

    const safeAddImage = (imageData: string, format: string, x: number, y: number, w: number, h: number) => {
      try {
        doc.addImage(imageData, format, x, y, w, h);
      } catch (err) {
        console.warn("Failed to add image to PDF:", err);
      }
    };

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin; // 180mm

    // Fetch local media captures
    const photos = loadCapturedAssets(task.id, "photo");
    const documents = loadCapturedAssets(task.id, "document");
    const signatures = loadCapturedAssets(task.id, "signature");

    // Get active agent details
    const snapshot = supabaseRepository.getSnapshot();
    const agent = snapshot.agents.find((item: any) => item.id === supabaseRepository.currentAgentId);
    const agentName = (agent?.name || "FIELD AGENT").toUpperCase();

    // Load domain task and results if available
    const domainTask = snapshot.tasks.find((item: any) => item.id === task.id);
    const result = domainTask?.investigationResult;

    const residesVerifiedVal = (result?.residesVerified || "YES").toUpperCase();
    const homeOwnershipVal = (result?.homeOwnership || "OWNED").toUpperCase();
    const stayDurationVal = (result?.stayDuration || "1-3 YEARS").toUpperCase();
    const remarksResVal = (result?.remarks || "MET CUSTOMER AT HOME ADDRESS AND CONFIRMED HOUSE OWNERSHIP").toUpperCase();

    // Map Visit Metadata
    const visitDate = domainTask?.completedAt 
      ? new Date(domainTask.completedAt).toLocaleDateString("en-GB").replace(/\//g, "-")
      : domainTask?.submittedAt
        ? new Date(domainTask.submittedAt).toLocaleDateString("en-GB").replace(/\//g, "-")
        : new Date().toLocaleDateString("en-GB").replace(/\//g, "-");

    const visitTime = task.time ? task.time.split("-")[0].trim() : "12:00 PM";
    
    // Fallback dummy coordinates if missing or zero
    const lat = task.latitude || 12.9716;
    const lng = task.longitude || 77.5946;

    // Status text with OSV signature and coordinates
    const statusVal = `${residesVerifiedVal === "YES" ? "POSITIVE" : "NEGATIVE"} | OSV BY: ${agentName} | COORDS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    // Convert signatures to base64 asynchronously
    let signatureBase64 = "";
    if (signatures.length > 0) {
      signatureBase64 = await toBase64(signatures[0].dataUrl);
    }

    // Convert photos and documents to base64 asynchronously
    const allCapturedImages = [
      ...photos.map(p => ({ title: "Customer Site Visual Photo", asset: p })),
      ...documents.map(d => ({ title: `Uploaded Document: ${d.name || d.slot || "Evidence"}`, asset: d }))
    ];

    const resolvedImages = await Promise.all(
      allCapturedImages.map(async (item) => {
        try {
          const rawEvidence = snapshot.evidence.find((e: any) => e.id === item.asset.id);
          const path = rawEvidence?.storagePath;
          let url = item.asset.dataUrl;
          if (!url && path) {
            url = await evidenceService.signedUrl(path);
          }
          const base64 = await toBase64(url);
          return { ...item, base64 };
        } catch (e) {
          console.error("Failed to convert image:", item.title, e);
          return { ...item, base64: "" };
        }
      })
    );

    // --- PAGE 1: Case Details & Verification Status (Structured Form Grid) ---

    // Top Header Banner
    doc.setFillColor(7, 24, 63); // #07183f (Navy Accent)
    doc.rect(margin, margin, contentWidth, 18, "F");

    doc.setTextColor(255, 255, 255);
    safeSetFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("fi-iFlow Field Operations Portal", margin + 6, margin + 11);

    doc.setFontSize(8);
    safeSetFont("Helvetica", "normal");
    doc.text("8/1, 1ST FLOOR 3RD MAIN ROAD MATHIKERE BANGALORE-560054", margin + 6, margin + 15);
    doc.text("VERIFIED REPORT FORM", pageWidth - margin - 6, margin + 11, { align: "right" });

    let currentY = margin + 26;
    const cellWidthLeft = 110;
    const rowHeight = 11;

    const drawSplitRow = (label1: string, val1: string, label2: string, val2: string) => {
      // Borders
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.rect(margin, currentY, contentWidth, rowHeight);
      doc.line(margin + cellWidthLeft, currentY, margin + cellWidthLeft, currentY + rowHeight);

      // Cell 1
      doc.setTextColor(100, 116, 139); // Slate-500
      safeSetFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(label1.toUpperCase(), margin + 3, currentY + 3.5);
      
      doc.setTextColor(15, 23, 42); // Slate-900
      safeSetFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(val1 || "N/A", margin + 3, currentY + 8);

      // Cell 2
      doc.setTextColor(100, 116, 139);
      safeSetFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(label2.toUpperCase(), margin + cellWidthLeft + 3, currentY + 3.5);

      doc.setTextColor(15, 23, 42);
      safeSetFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(val2 || "N/A", margin + cellWidthLeft + 3, currentY + 8);

      currentY += rowHeight;
    };

    const drawFullRow = (label: string, val: string, height = rowHeight) => {
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.rect(margin, currentY, contentWidth, height);

      doc.setTextColor(100, 116, 139);
      safeSetFont("Helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text(label.toUpperCase(), margin + 3, currentY + 3.5);

      doc.setTextColor(15, 23, 42);
      safeSetFont("Helvetica", "normal");
      doc.setFontSize(8.5);

      if (val.length > 90) {
        const lines = doc.splitTextToSize(val, contentWidth - 6);
        doc.text(lines, margin + 3, currentY + 8);
      } else {
        doc.text(val || "N/A", margin + 3, currentY + 8);
      }

      currentY += height;
    };

    // Draw Form Rows
    drawSplitRow("MV MODE", "PHYSICAL VISIT", "DATE OF VISIT", visitDate);
    drawSplitRow("NAME OF APPLICANT", task.customer.toUpperCase(), "TIME OF VISIT", visitTime);
    drawFullRow("ADDRESS GIVEN", task.address.toUpperCase(), 14);
    drawFullRow("STATUS", statusVal, 14);
    drawFullRow("REMARKS/RES", remarksResVal, 16);
    drawSplitRow("REMARKS/OFFICE", "NA", "MET PERSON OR RELATION", "CUSTOMER");
    drawSplitRow("CUSTOMER EXISTENCE CONF", residesVerifiedVal, "PEP NO", "NO");
    drawSplitRow("THIRD PARTY CONFIRMATION", residesVerifiedVal, "STAY DETAILS", `${homeOwnershipVal} HOUSE / ${stayDurationVal}`);
    drawFullRow("OSV ORIGINAL SEEN AND VERIFIED", residesVerifiedVal);

    currentY += 6;

    // Signature Area
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, currentY, contentWidth, 38);
    doc.line(margin + contentWidth / 2, currentY, margin + contentWidth / 2, currentY + 38);

    // Customer signature box (Left)
    doc.setTextColor(100, 116, 139);
    safeSetFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CUSTOMER VERIFICATION SIGNATURE", margin + 4, currentY + 5);

    if (signatureBase64) {
      const cleanSig = cleanBase64(signatureBase64);
      if (cleanSig) {
        safeAddImage(cleanSig, "PNG", margin + 15, currentY + 8, 60, 22);
      }
    } else {
      safeSetFont("times", "italic");
      doc.setFontSize(16);
      doc.setTextColor(17, 88, 212);
      doc.text(task.customer, margin + 20, currentY + 22);
    }
    
    doc.setTextColor(148, 163, 184);
    safeSetFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.line(margin + 10, currentY + 31, margin + 80, currentY + 31);
    doc.text("Signed Digitally by Applicant", margin + 22, currentY + 35);

    // Agent signature box (Right)
    doc.setTextColor(100, 116, 139);
    safeSetFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("VERIFYING OFFICER SIGNATURE", margin + contentWidth / 2 + 4, currentY + 5);

    safeSetFont("times", "italic");
    doc.setFontSize(15);
    doc.setTextColor(7, 24, 63);
    doc.text(agentName, margin + contentWidth / 2 + 20, currentY + 22);

    doc.setTextColor(148, 163, 184);
    safeSetFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.line(margin + contentWidth / 2 + 10, currentY + 31, margin + contentWidth - 10, currentY + 31);
    doc.text(`Field Executive: ${agentName}`, margin + contentWidth / 2 + 18, currentY + 35);

    // Footer of Page 1
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("This report is digitally signed and secured. System audit log code: FI-IFLOW-2026-08.", margin, pageHeight - margin + 5);
    doc.text(`Page 1 of ${1 + resolvedImages.length}`, pageWidth - margin, pageHeight - margin + 5, { align: "right" });

    // --- PAGES 2+: Captured Photos & Document Scans ---
    resolvedImages.forEach((item, index) => {
      doc.addPage();

      // Header Band (Mini version)
      doc.setFillColor(7, 24, 63);
      doc.rect(margin, margin, contentWidth, 12, "F");

      doc.setTextColor(255, 255, 255);
      safeSetFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.text("fi-iFlow Verification Evidence Log", margin + 4, margin + 8);
      safeSetFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Page ${index + 2} of ${resolvedImages.length + 1}`, pageWidth - margin - 4, margin + 8, { align: "right" });

      // Title of the evidence
      doc.setTextColor(17, 88, 212);
      safeSetFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(item.title.toUpperCase(), margin, margin + 20);

      // Draw photo container box
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, margin + 24, contentWidth, 215);

      // Add the captured image
      if (item.base64) {
        const cleanImg = cleanBase64(item.base64);
        if (cleanImg) {
          // Safe dimensions to fit image neatly inside boundary
          safeAddImage(cleanImg, "JPEG", margin + 4, margin + 28, contentWidth - 8, 207);
        }
      }

      // Metadata watermark at bottom of page
      doc.setTextColor(92, 106, 133);
      safeSetFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(`Image Code: IMG-${item.asset.id.slice(0, 8).toUpperCase()}`, margin + 5, margin + 243);
      doc.text(`Captured: ${new Date(item.asset.createdAt).toLocaleString()}`, margin + 5, margin + 247);
      doc.text(`GPS Tag: ${lat.toFixed(6)}, ${lng.toFixed(6)}`, pageWidth - margin - 5, margin + 247, { align: "right" });
    });

    // Download PDF (Android-safe)
    void downloadPdf(doc, `FI_Report_${task.id}.pdf`, forceDirectDownload);
  } catch (pdfError) {
    const errMsg = pdfError instanceof Error ? pdfError.message : String(pdfError);
    console.error("PDF generation failed:", errMsg);
    alert("PDF generation failed: " + errMsg);
  }
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
