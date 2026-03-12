(function () {
  /* ── DOM refs ──────────────────────────────────────────────────────────── */
  const itemsBody          = document.getElementById("items-body");
  const addRowBtn          = document.getElementById("add-row-btn");
  const downloadBtn        = document.getElementById("download-btn");
  const whatsappBtn        = document.getElementById("whatsapp-btn");
  const whatsappBtnText    = document.getElementById("whatsapp-btn-text");
  const subTotalEl         = document.getElementById("sub-total");
  const grandTotalEl       = document.getElementById("grand-total");
  const cgstAmountEl       = document.getElementById("cgst-amount");
  const sgstAmountEl       = document.getElementById("sgst-amount");
  const transportationInput= document.getElementById("transportation-cost");
  const fittingInput       = document.getElementById("fitting-cost");
  const advanceInput       = document.getElementById("advance-amount");
  const invoiceNumberInput = document.getElementById("invoice-number");
  const invoiceDateInput   = document.getElementById("invoice-date");
  const invoiceContainer   = document.getElementById("invoice-container");
  const pdfOverlay         = document.getElementById("pdf-overlay");

  const ESTIMATE_STORAGE_KEY   = "vga_last_estimate_number";
  const START_ESTIMATE_NUMBER  = 1001001;
  const WHATSAPP_NUMBER        = "917661843421";   // India +91

  /* ── Helpers ───────────────────────────────────────────────────────────── */
  function createCell(tag, className) {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    return cell;
  }

  function parseNumber(value) {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function showToast(html, durationMs) {
    let toast = document.getElementById("desktop-hint");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "desktop-hint";
      document.body.appendChild(toast);
    }
    toast.innerHTML = html;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, durationMs || 6000);
  }

  /* ── Totals ────────────────────────────────────────────────────────────── */
  function recalculateTotals() {
    let subTotal = 0;

    itemsBody.querySelectorAll("tr").forEach((row) => {
      const sqftInp   = row.querySelector(".sqft-input");
      const rateInp   = row.querySelector(".rate-input");
      const amountCell= row.querySelector(".amount-cell");
      const sqft  = parseNumber(sqftInp?.value);
      const rate  = parseNumber(rateInp?.value);
      const amount= sqft * rate;
      if (amountCell) amountCell.textContent = amount.toFixed(2);
      subTotal += amount;
    });

    subTotalEl.textContent = subTotal.toFixed(2);

    const transportation = parseNumber(transportationInput?.value);
    const fitting        = parseNumber(fittingInput?.value);
    const cgstRate = 0, sgstRate = 0;
    const cgstAmount = subTotal * (cgstRate / 100);
    const sgstAmount = subTotal * (sgstRate / 100);

    if (cgstAmountEl) cgstAmountEl.textContent = cgstAmount.toFixed(2);
    if (sgstAmountEl) sgstAmountEl.textContent = sgstAmount.toFixed(2);

    const preAdvance = subTotal + transportation + fitting + cgstAmount + sgstAmount;
    const advance    = parseNumber(advanceInput?.value);
    grandTotalEl.textContent = Math.max(0, preAdvance - advance).toFixed(2);
  }

  /* ── Date & Estimate Number ────────────────────────────────────────────── */
  function initInvoiceDate() {
    if (!invoiceDateInput) return;
    const now   = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day   = String(now.getDate()).padStart(2, "0");
    invoiceDateInput.value = `${year}-${month}-${day}`;
  }

  function initEstimateNumber() {
    if (!invoiceNumberInput) return;
    let next = START_ESTIMATE_NUMBER;
    try {
      const stored = localStorage.getItem(ESTIMATE_STORAGE_KEY);
      if (stored !== null) {
        // Every page load/refresh increments the invoice number by 1
        const parsed = parseInt(stored, 10);
        const current = isNaN(parsed) || parsed < START_ESTIMATE_NUMBER
          ? START_ESTIMATE_NUMBER : parsed;
        next = current + 1;
      }
      localStorage.setItem(ESTIMATE_STORAGE_KEY, String(next));
    } catch (_) {}
    invoiceNumberInput.value = String(next);
  }

  function incrementEstimateNumber() {
    if (!invoiceNumberInput) return;
    try {
      const stored  = localStorage.getItem(ESTIMATE_STORAGE_KEY);
      const current = (!stored || isNaN(parseInt(stored, 10)))
        ? START_ESTIMATE_NUMBER : parseInt(stored, 10);
      const next = current + 1;
      invoiceNumberInput.value = String(next);
      localStorage.setItem(ESTIMATE_STORAGE_KEY, String(next));
    } catch (_) {
      const shown = parseInt(invoiceNumberInput.value, 10);
      invoiceNumberInput.value = String(
        isNaN(shown) || shown < START_ESTIMATE_NUMBER
          ? START_ESTIMATE_NUMBER + 1 : shown + 1
      );
    }
  }

  /* ── Row management ────────────────────────────────────────────────────── */
  function renumberRows() {
    itemsBody.querySelectorAll("tr").forEach((row, i) => {
      const cell = row.querySelector(".serial-cell");
      if (cell) cell.textContent = String(i + 1);
    });
  }

  function attachInputListeners(row) {
    row.querySelectorAll("input").forEach((inp) =>
      inp.addEventListener("input", recalculateTotals)
    );
  }

  function addRow() {
    const row = document.createElement("tr");

    const serialCell = createCell("td", "serial-cell");
    row.appendChild(serialCell);

    const descCell  = createCell("td");
    const descInput = document.createElement("input");
    descInput.type = "text"; descInput.placeholder = "Description";
    descCell.appendChild(descInput); row.appendChild(descCell);

    const qtyCell  = createCell("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number"; qtyInput.min = "0"; qtyInput.step = "1";
    qtyInput.placeholder = "Qty";
    qtyCell.appendChild(qtyInput); row.appendChild(qtyCell);

    const sizeCell  = createCell("td");
    const sizeInput = document.createElement("input");
    sizeInput.type = "text"; sizeInput.placeholder = "Size";
    sizeCell.appendChild(sizeInput); row.appendChild(sizeCell);

    const sqftCell  = createCell("td");
    const sqftInput = document.createElement("input");
    sqftInput.type = "number"; sqftInput.min = "0"; sqftInput.step = "0.01";
    sqftInput.placeholder = "Sqft"; sqftInput.className = "sqft-input";
    sqftCell.appendChild(sqftInput); row.appendChild(sqftCell);

    const rateCell  = createCell("td");
    const rateInput = document.createElement("input");
    rateInput.type = "number"; rateInput.min = "0"; rateInput.step = "0.01";
    rateInput.placeholder = "Rate"; rateInput.className = "rate-input";
    rateCell.appendChild(rateInput); row.appendChild(rateCell);

    const amountCell = createCell("td", "amount-cell");
    amountCell.textContent = "0.00"; row.appendChild(amountCell);

    const actionCell = createCell("td", "action-col");
    const removeBtn  = document.createElement("button");
    removeBtn.type      = "button";
    removeBtn.className = "remove-row-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      row.remove(); renumberRows(); recalculateTotals();
    });
    actionCell.appendChild(removeBtn); row.appendChild(actionCell);

    itemsBody.appendChild(row);
    attachInputListeners(row);
    renumberRows();
    recalculateTotals();
  }

  /* ── PDF + WhatsApp ────────────────────────────────────────────────────── */
  async function sendWhatsAppPDF() {
    // Check libraries are loaded
    if (typeof html2canvas === "undefined" || typeof window.jspdf === "undefined") {
      alert("PDF libraries are still loading. Please wait a moment and try again.");
      return;
    }

    // Disable button & show overlay
    whatsappBtn.disabled = true;
    whatsappBtnText.textContent = "Generating PDF…";
    if (pdfOverlay) pdfOverlay.style.display = "flex";

    // Collect customer/invoice info (for filename & WhatsApp message)
    const customerName  = (document.getElementById("customer-name") || {}).value || "Customer";
    const siteName      = (document.getElementById("site-name")     || {}).value || "";
    const estimateNo    = invoiceNumberInput ? invoiceNumberInput.value.trim() : "";
    const dateVal       = invoiceDateInput   ? invoiceDateInput.value.trim()   : "";
    let   displayDate   = dateVal;
    if (dateVal && dateVal.includes("-")) {
      const [y, m, d] = dateVal.split("-");
      displayDate = `${d}/${m}/${y}`;
    }
    const grandTotal = grandTotalEl ? grandTotalEl.textContent : "0.00";
    const safeName   = customerName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const fileName   = `${safeName}_Vintage_Glass_Arts_Invoice.pdf`;

    // Elements to hide while capturing (buttons/overlay must not appear in PDF)
    const hideSelectors = [
      "#add-row-btn", "#download-btn", "#whatsapp-btn",
      ".remove-row-btn", ".action-col", "#pdf-overlay"
    ];
    const hiddenEls = [];
    hideSelectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.style.display !== "none") {
          el.dataset.prevDisplay = el.style.display;
          el.style.display = "none";
          hiddenEls.push(el);
        }
      });
    });

    try {
      /* Step 1 — Capture invoice as canvas */
      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      /* Step 2 — Convert canvas to A4 PDF */
      const { jsPDF } = window.jspdf;
      const pdf       = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW     = pdf.internal.pageSize.getWidth();
      const pageH     = pdf.internal.pageSize.getHeight();
      const imgData   = canvas.toDataURL("image/jpeg", 0.92);
      const imgW      = pageW;
      const imgH      = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position   = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH, "", "FAST");
      heightLeft -= pageH;

      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH, "", "FAST");
        heightLeft -= pageH;
      }

      /* Step 3 — Try Web Share API (mobile → opens WhatsApp share sheet) */
      const pdfBlob = pdf.output("blob");
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        // ✅ Mobile: native share sheet — user picks WhatsApp
        await navigator.share({
          files: [pdfFile],
          title: `Invoice - Vintage Glass Arts`,
          text: `Dear ${customerName},\nPlease find your estimate from Vintage Glass Arts attached.\n\nInvoice No: ${estimateNo}\nDate: ${displayDate}\nBalance Amount: ₹${grandTotal}\n\nThank you! 🙏`,
        });
      } else {
        /* Step 3b — Desktop fallback:
           1. Auto-download the PDF
           2. Open WhatsApp Web with a helpful text message
           3. Show a toast guiding the user to attach the PDF manually */
        pdf.save(fileName);

        const waText =
`Hi ${customerName}! 👋
Here is your Estimate from *Vintage Glass Arts*.

📄 Estimate No : ${estimateNo}
📅 Date        : ${displayDate}
🏗️ Site         : ${siteName || "—"}
💰 Grand Total : ₹${grandTotal}

The PDF invoice has been downloaded to your device.
Please find it attached.

Thank you for choosing Vintage Glass Arts! 🪟🙏
Near Owaisi Hospital, LB Nagar Road, Hyderabad - 500059
📞 7661843421`;

        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, "_blank");

        showToast(
          `✅ <strong>PDF downloaded!</strong><br>
           WhatsApp Web has opened. Please attach the downloaded PDF
           (<em>${fileName}</em>) manually using the 📎 attachment button in WhatsApp.`,
          9000
        );
      }
    } catch (err) {
      if (err && err.name === "AbortError") {
        // User cancelled the share sheet — silent exit
      } else {
        console.error("WhatsApp PDF error:", err);
        alert("Could not generate PDF. Please try again.\n\nDetails: " + err.message);
      }
    } finally {
      // Restore hidden elements
      hiddenEls.forEach((el) => {
        el.style.display = el.dataset.prevDisplay || "";
        delete el.dataset.prevDisplay;
      });
      // Re-enable button
      if (pdfOverlay) pdfOverlay.style.display = "none";
      whatsappBtn.disabled = false;
      whatsappBtnText.textContent = "Send WhatsApp PDF";
    }
  }

  /* ── Download / Print ──────────────────────────────────────────────────── */
  function handleDownload() {
    const previousTitle    = document.title;
    const customerNameInput= document.getElementById("customer-name");
    const rawName  = customerNameInput ? customerNameInput.value.trim() : "";
    const safeName = rawName ? rawName.replace(/\s+/g, "_") : "customer";
    document.title = `${safeName}_Vintage Glass Arts`;
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
      incrementEstimateNumber();
    }, 1000);
  }

  /* ── Bootstrap ─────────────────────────────────────────────────────────── */
  initInvoiceDate();
  initEstimateNumber();
  addRow();

  if (transportationInput) transportationInput.addEventListener("input", recalculateTotals);
  if (fittingInput)         fittingInput.addEventListener("input", recalculateTotals);
  if (advanceInput)         advanceInput.addEventListener("input", recalculateTotals);
  if (addRowBtn)            addRowBtn.addEventListener("click", addRow);
  if (downloadBtn)          downloadBtn.addEventListener("click", handleDownload);
  if (whatsappBtn)          whatsappBtn.addEventListener("click", sendWhatsAppPDF);
})();
