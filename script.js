// Hamburger List
const menuToggle = document.getElementById('menuToggle');
const menuOverlay = document.getElementById('menuOverlay');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  menuOverlay.classList.toggle('active');

  // Reset animations when closing menu
  if (!menuOverlay.classList.contains('active')) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
    });
  }
});




// Get the container element
var btnContainer = document.getElementById("lists");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}









// Grams Calculator Script
function calculateGrams() {
  const grams = parseFloat(document.getElementById('grams').value);
  const rupees = parseFloat(document.getElementById('rupees').value);
  const purchaseRupees = parseFloat(document.getElementById('purchaseRupees').value);
  const resultDiv = document.getElementById('result');

  if (isNaN(grams) || isNaN(rupees) || isNaN(purchaseRupees) || rupees === 0) {
    resultDiv.textContent = "Please Enter Grams. Rupees Cannot be Zero.";
    return;
  }

  const rate = grams / rupees;
  const totalGrams = rate * purchaseRupees;
  resultDiv.textContent = `You will get ${totalGrams.toFixed(2)} Grams.`;
}