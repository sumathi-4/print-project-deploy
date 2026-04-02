const fileInput = document.getElementById("file");
const fileName = document.getElementById("fileName");
const pageCountText = document.getElementById("pageCount");
const displayPages = document.getElementById("displayPages");
const printTypeRadios = document.querySelectorAll('input[name="type"]');
const copiesInput = document.getElementById("copies");
const displayCopies = document.getElementById("displayCopies");
const totalPrice = document.getElementById("price");
const pricePerPageSpan = document.getElementById("pricePerPage");
const orderBtn = document.getElementById("orderBtn");
const resetBtn = document.getElementById("resetBtn");
const decreaseCopies = document.getElementById("decreaseCopies");
const increaseCopies = document.getElementById("increaseCopies");

let pages = 0;


function updatePricePerPage() {
  const selectedType = document.querySelector('input[name="type"]:checked').value;
  pricePerPageSpan.textContent = selectedType === "bw" ? "₹2" : "₹5";
  calculatePrice();
}


            fileInput.addEventListener("change", () => {
              const file = fileInput.files[0];
  
              if (!file) {
                  fileName.textContent = "No file selected";
                  return;
                 }
  
  if (file.type !== "application/pdf") {
    alert("Only PDF files are allowed");
    fileInput.value = "";
    fileName.textContent = "No file selected";
    return;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert("File size should be less than 10MB");
    fileInput.value = "";
    fileName.textContent = "No file selected";
    return;
  }
  
  fileName.textContent = file.name;
  
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  
  reader.onload = async function () {
    try {
      const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
      pages = pdf.numPages;
      pageCountText.textContent = pages;
      displayPages.textContent = pages;
      calculatePrice();
    } catch (error) {
      alert("Invalid PDF file");
      fileInput.value = "";
      fileName.textContent = "No file selected";
      pageCountText.textContent = "0";
      displayPages.textContent = "0";
      pages = 0;
    }
  };
});


decreaseCopies.addEventListener("click", () => {
  let val = parseInt(copiesInput.value);
  if (val > 1) {
    copiesInput.value = val - 1;
    updateCopies();
  }
});

increaseCopies.addEventListener("click", () => {
  let val = parseInt(copiesInput.value);
  if (val < 100) {
    copiesInput.value = val + 1;
    updateCopies();
  } else {
    alert("Maximum 100 copies allowed");
  }
});


copiesInput.addEventListener("input", () => {
  let val = parseInt(copiesInput.value);
  
  if (isNaN(val) || val < 1) {
    copiesInput.value = 1;
  } else if (val > 100) {
    copiesInput.value = 100;
    alert("Maximum 100 copies allowed");
  }
  
  updateCopies();
});

function updateCopies() {
  displayCopies.textContent = copiesInput.value;
  calculatePrice();
}


printTypeRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    updatePricePerPage();
  });
});

function calculatePrice() {
  if (pages === 0) {
    totalPrice.textContent = "0";
    return;
  }
  
  const selectedType = document.querySelector('input[name="type"]:checked').value;
  const pricePerPage = selectedType === "bw" ? 2 : 5;
  const total = pages * pricePerPage * parseInt(copiesInput.value);
  totalPrice.textContent = total;
}


resetBtn.addEventListener("click", () => {
  fileInput.value = "";
  fileName.textContent = "No file selected";
  pageCountText.textContent = "0";
  displayPages.textContent = "0";
  copiesInput.value = "1";
  displayCopies.textContent = "1";
  document.querySelector('input[value="bw"]').checked = true;
  pages = 0;
  updatePricePerPage();
  calculatePrice();
});


orderBtn.addEventListener("click", () => {
  if (!fileName.textContent || fileName.textContent === "No file selected" || pages === 0) {
    alert("Please upload a valid PDF file first");
    return;
  }
  
  const selectedType = document.querySelector('input[name="type"]:checked').value;
  const typeText = selectedType === "bw" ? "Black & White" : "Color";
  
  const confirmMsg = confirm(`Confirm Order:\n\nFile: ${fileName.textContent}\nPages: ${pages}\nType: ${typeText}\nCopies: ${copiesInput.value}\nTotal: ₹${totalPrice.textContent}\n\nPlace order?`);
  
  if (!confirmMsg) return;
  
  const orderData = {
    fileName: fileName.textContent,
    pages: pages,
    type: selectedType,
    copies: copiesInput.value,
    price: totalPrice.textContent
  };
  
  fetch("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    resetBtn.click(); // Reset after successful order
  })
  .catch(error => {
    alert("Failed to place order. Make sure server is running.");
    console.error(error);
  });
});
updatePricePerPage();
updateCopies();