// ==========================================
// GOOGLE APPS SCRIPT WEB APP URL
// ==========================================
// IMPORTANT:
// Replace this with your deployed Apps Script
// Web App URL ending in /exec
//
// Example:
// https://script.google.com/macros/s/XXXXXXXX/exec

const API_URL =
  "https://script.google.com/macros/s/AKfycbzkAPNo4lbeEhtHJIbKuGhnPHWfp1W2EgxNwRbJuNil-OSpNhbjzXCwwrOQwNdSbz_9wA/exec";


// ==========================================
// GET ELEMENTS
// ==========================================

const itemNameInput = document.getElementById("item-name");
const quantityInput = document.getElementById("quantity");
const unitPriceInput = document.getElementById("unit-price");

const addButton = document.getElementById("add-item");

const tableBody = document.querySelector("tbody");


// ==========================================
// LOAD ITEMS
// ==========================================

async function loadItems() {

  try {

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">
          Loading inventory...
        </td>
      </tr>
    `;

    const response = await fetch(
      API_URL + "?action=getItems"
    );

    if (!response.ok) {
      throw new Error("Failed to connect to server.");
    }

    const data = await response.json();

    displayItems(data);

  } catch (error) {

    console.error(error);

    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="error">
          ❌ Failed load data — check URL/permissions
        </td>
      </tr>
    `;
  }
}


// ==========================================
// DISPLAY ITEMS
// ==========================================

function displayItems(items) {

  tableBody.innerHTML = "";

  if (!items || items.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          No inventory items found.
        </td>
      </tr>
    `;

    return;
  }


  items.forEach(function(item) {

    const id = item[0];
    const itemName = item[1];
    const quantity = Number(item[2]);
    const unitPrice = Number(item[3]);
    const totalValue = Number(item[4]);


    const row = document.createElement("tr");


    // LOW STOCK
    let stockClass = "";

    if (quantity <= 5) {
      stockClass = "low-stock";
    }


    row.innerHTML = `

      <td>
        ${escapeHTML(itemName)}
      </td>

      <td class="${stockClass}">
        ${quantity}

        ${
          quantity <= 5
            ? '<span class="stock-warning"> ⚠️ Low Stock</span>'
            : ''
        }

      </td>

      <td>
        ₱${unitPrice.toFixed(2)}
      </td>

      <td>
        ₱${totalValue.toFixed(2)}
      </td>

      <td>

        <button
          class="edit-btn"
          onclick="editItem(
            '${id}',
            '${escapeHTML(itemName)}',
            '${quantity}',
            '${unitPrice}'
          )">
          ✏️ Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteItem('${id}')">
          🗑️ Delete
        </button>

      </td>

    `;


    tableBody.appendChild(row);

  });

}


// ==========================================
// ADD ITEM
// ==========================================

async function addItem() {

  const itemName =
    itemNameInput.value.trim();

  const quantity =
    quantityInput.value;

  const unitPrice =
    unitPriceInput.value;


  // VALIDATION

  if (itemName === "") {

    alert("Please enter an item name.");
    return;

  }


  if (
    quantity === "" ||
    Number(quantity) < 0
  ) {

    alert("Please enter a valid quantity.");
    return;

  }


  if (
    unitPrice === "" ||
    Number(unitPrice) < 0
  ) {

    alert("Please enter a valid unit price.");
    return;

  }


  try {

    addButton.disabled = true;

    addButton.textContent = "Adding...";


    const url =
      API_URL +
      "?action=addItem" +
      "&itemName=" +
      encodeURIComponent(itemName) +
      "&quantity=" +
      encodeURIComponent(quantity) +
      "&unitPrice=" +
      encodeURIComponent(unitPrice);


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message || "Failed to add item."
      );

    }


    alert("✅ Item added successfully!");


    clearForm();

    loadItems();


  } catch (error) {

    console.error(error);

    alert(
      "❌ Failed to add item.\n\n" +
      error.message
    );

  } finally {

    addButton.disabled = false;

    addButton.textContent = "Add Item";

  }

}


// ==========================================
// EDIT ITEM
// ==========================================

async function editItem(
  id,
  oldName,
  oldQuantity,
  oldPrice
) {

  const itemName =
    prompt(
      "Enter item name:",
      oldName
    );


  if (itemName === null) {
    return;
  }


  const quantity =
    prompt(
      "Enter quantity:",
      oldQuantity
    );


  if (quantity === null) {
    return;
  }


  const unitPrice =
    prompt(
      "Enter unit price:",
      oldPrice
    );


  if (unitPrice === null) {
    return;
  }


  if (
    itemName.trim() === "" ||
    Number(quantity) < 0 ||
    Number(unitPrice) < 0
  ) {

    alert("Please enter valid information.");

    return;

  }


  try {

    const url =
      API_URL +
      "?action=updateItem" +
      "&id=" +
      encodeURIComponent(id) +
      "&itemName=" +
      encodeURIComponent(itemName) +
      "&quantity=" +
      encodeURIComponent(quantity) +
      "&unitPrice=" +
      encodeURIComponent(unitPrice);


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    alert("✅ Item updated successfully!");


    loadItems();


  } catch (error) {

    console.error(error);

    alert(
      "❌ Failed to update item.\n\n" +
      error.message
    );

  }

}


// ==========================================
// DELETE ITEM
// ==========================================

async function deleteItem(id) {

  const confirmDelete =
    confirm(
      "Are you sure you want to delete this item?"
    );


  if (!confirmDelete) {
    return;
  }


  try {

    const url =
      API_URL +
      "?action=deleteItem" +
      "&id=" +
      encodeURIComponent(id);


    const response =
      await fetch(url);


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message
      );

    }


    alert("🗑️ Item deleted successfully!");


    loadItems();


  } catch (error) {

    console.error(error);

    alert(
      "❌ Failed to delete item.\n\n" +
      error.message
    );

  }

}


// ==========================================
// CLEAR FORM
// ==========================================

function clearForm() {

  itemNameInput.value = "";
  quantityInput.value = "";
  unitPriceInput.value = "";

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ==========================================
// ADD BUTTON
// ==========================================

if (addButton) {

  addButton.addEventListener(
    "click",
    addItem
  );

}


// ==========================================
// LOAD DATA WHEN PAGE OPENS
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadItems();

  }
);
