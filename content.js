// Save all form data with SHA-256 encryption
async function saveFormData() {
    const inputs = document.querySelectorAll("input, textarea, select");
    const formData = {};
    inputs.forEach((input) => {
      if (input.value && (input.name || input.id)) {
        const key = input.name || input.id;
        formData[key] = input.value;
      }
    });
  
    const hostname = window.location.hostname;
    // SHA-256 ile verileri şifrele
    const encryptedData = {};
    for (let key in formData) {
      encryptedData[key] = await sha256(formData[key]);
    }
  
    chrome.runtime.sendMessage({
      action: "saveData",
      hostname: hostname,
      data: formData // Orijinal veriyi saklıyoruz, şifreli değil
    }, () => {
      chrome.storage.local.set({ [hostname]: { original: formData, encrypted: encryptedData } }, () => {
        console.log(`Data saved for ${hostname}`);
      });
    });
  }
  
  // SHA-256 hash function
  async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  
  // Load and fill form data
  function loadFormData() {
    const hostname = window.location.hostname;
    chrome.storage.local.get([hostname], (result) => {
      const formData = result[hostname]?.original; // Orijinal veriyi kullanıyoruz
      if (formData) {
        const inputs = document.querySelectorAll("input, textarea, select");
        inputs.forEach((input) => {
          const key = input.name || input.id;
          if (formData[key]) {
            input.value = formData[key];
          }
        });
      }
    });
  }
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save") {
      saveFormData().then(() => sendResponse({ success: true }));
      return true; // Async response için
    } else if (message.action === "load") {
      loadFormData();
      sendResponse({ success: true });
    }
  });