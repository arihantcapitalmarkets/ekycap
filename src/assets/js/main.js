// ------------ Generic ---------------------------------------------------------


// Check if DOM content is loaded
document.addEventListener("DOMContentLoaded", function (event) {
});


// ------------ Top navigation ---------------------------------------------------------


// Visibility toggle for Product Dropdown (Collapsed View)
function showProductsDropdownCollapsed(id) {
  var element = document.getElementById(id);
  if (element.style.display === "block") {
    element.style.display = "none";
    document.getElementById("icon-chevron-collapsed").style.transform = "rotate(0deg)";
  } else {
    element.style.display = "block";
    document.getElementById("icon-chevron-collapsed").style.transform = "rotate(180deg)";
  }
}
// End of - Visibility toggle for Product Dropdown (Collapsed View)

// Visibility toggle for Calculator Dropdown (Collapsed View)
function showCalculatorDropdownCollapsed(id) {
  var element = document.getElementById(id);
  if (element.style.display === "block") {
    element.style.display = "none";
    document.getElementById("calculator-icon-chevron-collapsed").style.transform = "rotate(0deg)";
  } else {
    element.style.display = "block";
    document.getElementById("calculator-icon-chevron-collapsed").style.transform = "rotate(180deg)";
  }
}


// Visibility toggle for About Us Dropdown (Collapsed View)
function showAboutUsDropdownCollapsed() {
  var element = document.getElementById("overflow-dropdown-options-about-us");
  if (element.style.display === "block") {
    element.style.display = "none";
    document.getElementById("icon-chevron-collapsed-about-us").style.transform = "rotate(0deg)";
  }
  else {
    element.style.display = "block";
    document.getElementById("icon-chevron-collapsed-about-us").style.transform = "rotate(180deg)";
  }
}
// End of - Visibility toggle for About Us Dropdown (Collapsed View)


//  Visibility toggle for Overflow menubar (Collapsed View)
function showOverflowMenu() {
  var element = document.getElementById("overflow-menu");
  if (element.style.display === "block") {
    element.style.display = "none";
  }
  else {
    element.style.display = "block";
  }
}
//  End of - Visibility toggle for Overflow menubar (Collapsed View)
// ------------ Half Section Veiw ---------------------------------------------------------
// Half section view support height
function halfSectionSupportHeight() {
  setTimeout(() => {
    let imageHeightElement = document.getElementById("half-section-content");
    if (imageHeightElement) {
      var imageHeight = imageHeightElement.offsetHeight
      document.getElementById("half-section-cover").style.height = imageHeight / 2 + "px";
      document.getElementById("half-section-cover").style.marginTop = (0 - (imageHeight / 2)) + "px";
    }
  }, 500);
}
// End of - Half section view support height