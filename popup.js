document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.getElementById("saveBtn");
    const loadBtn = document.getElementById("loadBtn");
    const savedList = document.getElementById("savedList");
  
    // Load saved data and display only hostname
    function loadSavedData() {
      savedList.innerHTML = "";
      chrome.storage.local.get(null, (items) => {
        for (let hostname in items) {
          const li = document.createElement("li");
          li.textContent = hostname; // Sadece hostname göster
          
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.className = "delete-btn";
          deleteBtn.onclick = () => showConfirmation(hostname);
          li.appendChild(deleteBtn);
  
          savedList.appendChild(li);
        }
      });
    }
    loadSavedData();
  
    // Save new data
    saveBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "save" }, (response) => {
          if (response && response.success) {
            alert("Data saved successfully!");
            loadSavedData(); // Refresh list
          }
        });
      });
    });
  
    // Fill form
    loadBtn.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "load" }, (response) => {
          if (response && response.success) {
            alert("Form filled successfully!");
          }
        });
      });
    });
  
    // Show delete confirmation
    function showConfirmation(hostname) {
      const confirmationDiv = document.createElement("div");
      confirmationDiv.className = "confirmation";
      confirmationDiv.innerHTML = `
        <div class="confirmation-box">
          <p>Are you sure you want to delete data for ${hostname}?</p>
          <button id="confirmYes">Yes</button>
          <button id="confirmNo">No</button>
        </div>
      `;
      document.body.appendChild(confirmationDiv);
  
      document.getElementById("confirmYes").onclick = () => {
        chrome.storage.local.remove(hostname, () => {
          document.body.removeChild(confirmationDiv);
          loadSavedData(); // Refresh list
        });
      };
  
      document.getElementById("confirmNo").onclick = () => {
        document.body.removeChild(confirmationDiv);
      };
    }
  });