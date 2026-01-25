const dateInput = document.getElementById("date");
const billAmountInput = document.getElementById("billAmount");
const approvedAmountInput = document.getElementById("approvedAmount");
const hospitalDiscountInput = document.getElementById("hospitalDiscount");
const tdInput = document.getElementById("tdInfo");
const advanceAmountInput = document.getElementById("advanceAmount");
const totalAmountInput = document.getElementById("totalAmount");
const amountToCollectInput = document.getElementById("amountToCollect");
const amountToRefundInput = document.getElementById("amountToRefund");
const mergeBtn = document.getElementById("mergeBtn");
const pdfFileInput = document.getElementById("pdfFile");
const form = document.getElementById("clearance-form");
const formActions = document.querySelector(".form-actions");
const ipNoInput = document.getElementById("ipNo");
const patientNameInput = document.getElementById("patientName");
const tpaInput = document.getElementById("tpaName");

function setTodayDate() {
  if (!dateInput) return;
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${year}-${month}-${day}`;
}

function calculateTotals() {
  const bill = parseFloat(billAmountInput.value) || 0;
  const approved = parseFloat(approvedAmountInput.value) || 0;
  const discount = parseFloat(hospitalDiscountInput.value) || 0;
  const td = parseFloat(tdInput.value) || 0;
  const advance = parseFloat(advanceAmountInput.value) || 0;

  // Step 1: Total Amount = Bill - Approved - Discount - T/D
  let total = bill - approved - discount - td;
  if (total < 0) total = 0;
  totalAmountInput.value = total.toFixed(2);

  // Step 2: Net after Advance
  let net = total - advance;

  if (net >= 0) {
    // Patient has to pay this much
    amountToCollectInput.value = net.toFixed(2);
    amountToRefundInput.value = "0.00";
  } else {
    // Hospital has to refund this much
    amountToCollectInput.value = "0.00";
    amountToRefundInput.value = Math.abs(net).toFixed(2);
  }
}

// Auto-set date on page load
window.addEventListener("load", () => {
  setTodayDate();
  calculateTotals();

  // Prepare TPA option list for quick keyboard selection
  if (tpaInput) {
    const optionNodes = document.querySelectorAll("#tpaList option");
    window._tpaOptions = Array.from(optionNodes).map(o => o.value);
  }
});

billAmountInput.addEventListener("input", calculateTotals);
approvedAmountInput.addEventListener("input", calculateTotals);
hospitalDiscountInput.addEventListener("input", calculateTotals);
tdInput.addEventListener("input", calculateTotals);
advanceAmountInput.addEventListener("input", calculateTotals);

// Allow Enter key to snap to the closest matching TPA name
if (tpaInput) {
  tpaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // don't submit the form
      const val = tpaInput.value.trim().toLowerCase();
      if (!val || !window._tpaOptions) return;
      const match = window._tpaOptions.find(v => v.toLowerCase().startsWith(val));
      if (match) {
        tpaInput.value = match;
      }
      // Optional: move focus to next field
      // document.getElementById("copaymentAmount")?.focus();
    }
  });
}

// After reset, put today date back
form.addEventListener("reset", () => {
  setTimeout(() => {
    setTodayDate();
    calculateTotals();
  }, 0);
});

async function mergePdfWithForm() {
  if (!pdfFileInput.files || !pdfFileInput.files[0]) {
    alert("Please choose a PDF file to merge.");
    return;
  }

  const file = pdfFileInput.files[0];

  try {
    mergeBtn.disabled = true;
    const originalText = mergeBtn.textContent;
    mergeBtn.textContent = "Merging...";

    // Temporarily hide buttons so they don't appear in the merged output
    let previousDisplay = null;
    if (formActions) {
      previousDisplay = formActions.style.display;
      formActions.style.display = "none";
    }

    // 1. Capture the form page as an image
    const pageElement = document.querySelector(".page");
    const canvas = await html2canvas(pageElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // 2. Turn that image into a one-page PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const pdfDoc = new jsPDF("p", "mm", "a4");
    const imgProps = pdfDoc.getImageProperties(imgData);
    const pdfWidth = pdfDoc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdfDoc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const formPdfBytes = pdfDoc.output("arraybuffer");

    // 3. Load the uploaded PDF and the form PDF using pdf-lib
    const uploadedBytes = await file.arrayBuffer();
    const mergedPdf = await PDFLib.PDFDocument.create();
    const formPdf = await PDFLib.PDFDocument.load(formPdfBytes);
    const otherPdf = await PDFLib.PDFDocument.load(uploadedBytes);

    const [formPage] = await mergedPdf.copyPages(formPdf, [0]);
    mergedPdf.addPage(formPage);

    const otherPages = await mergedPdf.copyPages(otherPdf, otherPdf.getPageIndices());
    otherPages.forEach(p => mergedPdf.addPage(p));

    const mergedBytes = await mergedPdf.save();

    // 4. Trigger download of the merged PDF with dynamic name
    const blob = new Blob([mergedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Build filename: "ipNo patientName APPROVED.pdf"
    const ipVal = (ipNoInput?.value || "").trim();
    const patientVal = (patientNameInput?.value || "").trim();
    const sanitize = str => str.replace(/[\\/:*?"<>|]/g, "_");

    let fileName = "insurance-clearance-merged.pdf";
    if (ipVal || patientVal) {
      const parts = [];
      if (ipVal) parts.push(sanitize(ipVal));
      if (patientVal) parts.push(sanitize(patientVal));
      parts.push("APPROVED");
      fileName = parts.join(" ") + ".pdf";
    }

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Restore form actions visibility
    if (formActions) {
      formActions.style.display = previousDisplay || "";
    }

    mergeBtn.textContent = originalText;
    mergeBtn.disabled = false;
  } catch (err) {
    // Ensure we restore actions and button state even on error
    if (formActions) {
      formActions.style.display = previousDisplay || "";
    }
    console.error(err);
    alert("Error while merging PDF. Please try again.");
    mergeBtn.textContent = "Merge PDF";
    mergeBtn.disabled = false;
  }
}

mergeBtn.addEventListener("click", mergePdfWithForm);