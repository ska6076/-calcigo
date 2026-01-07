(function () {
  const itemsBody = document.getElementById("items-body");
  const addRowBtn = document.getElementById("add-row-btn");
  const downloadBtn = document.getElementById("download-btn");
  const subTotalEl = document.getElementById("sub-total");
  const grandTotalEl = document.getElementById("grand-total");
  const cgstAmountEl = document.getElementById("cgst-amount");
  const sgstAmountEl = document.getElementById("sgst-amount");
  const transportationInput = document.getElementById("transportation-cost");
  const fittingInput = document.getElementById("fitting-cost");
  const advanceInput = document.getElementById("advance-amount");
  const invoiceNumberInput = document.getElementById("invoice-number");
  const invoiceDateInput = document.getElementById("invoice-date");
  const ESTIMATE_STORAGE_KEY = "vga_last_estimate_number";
  const START_ESTIMATE_NUMBER = 1001001;

  function createCell(tag, className) {
    const cell = document.createElement(tag);
    if (className) cell.className = className;
    return cell;
  }

  function parseNumber(value) {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function recalculateTotals() {
    let subTotal = 0;

    const rows = itemsBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const sqftInput = row.querySelector(".sqft-input");
      const rateInput = row.querySelector(".rate-input");
      const amountCell = row.querySelector(".amount-cell");

      const sqft = parseNumber(sqftInput?.value);
      const rate = parseNumber(rateInput?.value);
      const amount = sqft * rate;

      if (amountCell) {
        amountCell.textContent = amount.toFixed(2);
      }

      subTotal += amount;
    });

    subTotalEl.textContent = subTotal.toFixed(2);

    const transportation = transportationInput
      ? parseNumber(transportationInput.value)
      : 0;

    const fitting = fittingInput ? parseNumber(fittingInput.value) : 0;

    // GST split into CGST and SGST (both currently 0%).
    const cgstRate = 0;
    const sgstRate = 0;
    const cgstAmount = subTotal * (cgstRate / 100);
    const sgstAmount = subTotal * (sgstRate / 100);

    if (cgstAmountEl) {
      cgstAmountEl.textContent = cgstAmount.toFixed(2);
    }
    if (sgstAmountEl) {
      sgstAmountEl.textContent = sgstAmount.toFixed(2);
    }

    const preAdvanceTotal = subTotal + transportation + fitting + cgstAmount + sgstAmount;

    const advance = advanceInput ? parseNumber(advanceInput.value) : 0;
    const grandTotal = Math.max(0, preAdvanceTotal - advance);

    grandTotalEl.textContent = grandTotal.toFixed(2);
  }

  function initInvoiceDate() {
    if (!invoiceDateInput) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    invoiceDateInput.value = `${year}-${month}-${day}`;
  }

  function initEstimateNumber() {
    if (!invoiceNumberInput) return;

    let currentNumber = START_ESTIMATE_NUMBER;

    try {
      if (typeof localStorage !== "undefined") {
        const lastValue = localStorage.getItem(ESTIMATE_STORAGE_KEY);

        if (lastValue === null) {
          // First estimate number: 7-digit starting value
          currentNumber = START_ESTIMATE_NUMBER;
        } else {
          const parsed = parseInt(lastValue, 10);
          // If stored value is invalid or below the configured start, reset to start; otherwise use stored value
          currentNumber = isNaN(parsed) || parsed < START_ESTIMATE_NUMBER
            ? START_ESTIMATE_NUMBER
            : parsed;
        }

        localStorage.setItem(ESTIMATE_STORAGE_KEY, String(currentNumber));
      }
    } catch (e) {
      // If localStorage is not accessible (e.g., file:// restrictions), just fall back to START_ESTIMATE_NUMBER.
      currentNumber = START_ESTIMATE_NUMBER;
    }

    const formatted = String(currentNumber); // keep natural 7-digit formatting
    invoiceNumberInput.value = formatted;
  }

  function incrementEstimateNumberForNextUse() {
    if (!invoiceNumberInput) return;

    let currentNumber = START_ESTIMATE_NUMBER;

    try {
      if (typeof localStorage !== "undefined") {
        const lastValue = localStorage.getItem(ESTIMATE_STORAGE_KEY);

        if (lastValue === null) {
          currentNumber = START_ESTIMATE_NUMBER;
        } else {
          const parsed = parseInt(lastValue, 10);
          currentNumber = isNaN(parsed) || parsed < START_ESTIMATE_NUMBER
            ? START_ESTIMATE_NUMBER
            : parsed;
        }

        const nextNumber = currentNumber + 1;
        invoiceNumberInput.value = String(nextNumber);
        localStorage.setItem(ESTIMATE_STORAGE_KEY, String(nextNumber));
        return;
      }
    } catch (e) {
      // If localStorage fails, just increment in-memory.
      currentNumber = START_ESTIMATE_NUMBER;
    }

    // Fallback path when localStorage is not available: just bump from what is currently shown.
    const shown = parseInt(invoiceNumberInput.value, 10);
    const base = isNaN(shown) || shown < START_ESTIMATE_NUMBER ? START_ESTIMATE_NUMBER : shown;
    const next = base + 1;
    invoiceNumberInput.value = String(next);
  }

  function renumberRows() {
    const rows = itemsBody.querySelectorAll("tr");
    rows.forEach((row, index) => {
      const serialCell = row.querySelector(".serial-cell");
      if (serialCell) {
        serialCell.textContent = String(index + 1);
      }
    });
  }

  function attachInputListeners(row) {
    const inputs = row.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", recalculateTotals);
    });
  }

  function addRow() {
    const row = document.createElement("tr");

    // S. No
    const serialCell = createCell("td", "serial-cell");
    row.appendChild(serialCell);

    // Description
    const descCell = createCell("td");
    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.placeholder = "Description";
    descCell.appendChild(descInput);
    row.appendChild(descCell);

    // Quantity
    const qtyCell = createCell("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "0";
    qtyInput.step = "1";
    qtyInput.placeholder = "Qty";
    qtyCell.appendChild(qtyInput);
    row.appendChild(qtyCell);

    // Size
    const sizeCell = createCell("td");
    const sizeInput = document.createElement("input");
    sizeInput.type = "text";
    sizeInput.placeholder = "Size";
    sizeCell.appendChild(sizeInput);
    row.appendChild(sizeCell);

    // Sqft
    const sqftCell = createCell("td");
    const sqftInput = document.createElement("input");
    sqftInput.type = "number";
    sqftInput.min = "0";
    sqftInput.step = "0.01";
    sqftInput.placeholder = "Sqft";
    sqftInput.className = "sqft-input";
    sqftCell.appendChild(sqftInput);
    row.appendChild(sqftCell);

    // Rate / Sqft
    const rateCell = createCell("td");
    const rateInput = document.createElement("input");
    rateInput.type = "number";
    rateInput.min = "0";
    rateInput.step = "0.01";
    rateInput.placeholder = "Rate";
    rateInput.className = "rate-input";
    rateCell.appendChild(rateInput);
    row.appendChild(rateCell);

    // Amount
    const amountCell = createCell("td", "amount-cell");
    amountCell.textContent = "0.00";
    row.appendChild(amountCell);

    // Action (Remove button)
    const actionCell = createCell("td");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-row-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      row.remove();
      renumberRows();
      recalculateTotals();
    });
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);

    itemsBody.appendChild(row);

    attachInputListeners(row);
    renumberRows();
    recalculateTotals();
  }

  // Initialize date, estimate number and one empty row
  initInvoiceDate();
  initEstimateNumber();
  addRow();

  // Recalculate totals when transportation, fitting or advance amount changes
  if (transportationInput) {
    transportationInput.addEventListener("input", recalculateTotals);
  }

  if (fittingInput) {
    fittingInput.addEventListener("input", recalculateTotals);
  }

  if (advanceInput) {
    advanceInput.addEventListener("input", recalculateTotals);
  }

  if (addRowBtn) {
    addRowBtn.addEventListener("click", addRow);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const previousTitle = document.title;
      const customerNameInput = document.getElementById("customer-name");
      const rawName = customerNameInput ? customerNameInput.value.trim() : "";
      const safeName = rawName ? rawName.replace(/\s+/g, "_") : "customer";

      // The browser typically uses document.title as the suggested PDF file name.
      document.title = `${safeName}_Vintage Glass Arts`;
      window.print();

      // Restore the original title shortly after triggering print and prepare next estimate number.
      setTimeout(() => {
        document.title = previousTitle;
        incrementEstimateNumberForNextUse();
      }, 1000);
    });
  }
})();