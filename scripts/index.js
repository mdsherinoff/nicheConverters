const baseURL = "http://localhost:3000/api/player/";

const codeBox = document.querySelector("#codeInput");
const detailsArea = document.querySelector(".details");

document
  .getElementById("codeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const code = codeBox.value.trim();

    // Validate the input code
    if (!code) {
      detailsArea.innerHTML = `<p style="color: red;">Please enter a player tag.</p>`;
      return;
    }

    if (!/^#?[A-Za-z0-9]{8,10}$/.test(code)) {
      detailsArea.innerHTML = `<p style="color: red;">Invalid code. Please enter a valid Clash of Clans tag (8–10 alphanumeric characters).</p>`;
      return;
    }

    try {
      // Add a loading spinner
      detailsArea.innerHTML = `<div class="spinner"></div><p>Loading player details...</p>`;

      // Remove the # if present and construct the URL
      const sanitizedCode = code.startsWith("#") ? code.slice(1) : code;
      const url = `${baseURL}${sanitizedCode}`;

      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Player not found. Please check the tag.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Please check your API token.");
        } else {
          throw new Error(
            "Failed to fetch player data. Please try again later."
          );
        }
      }

      const data = await response.json();
      displayPlayerDetails(data);
    } catch (error) {
      detailsArea.innerHTML = `<p style="color: red;">Error: ${error.message || "An unexpected error occurred."}</p>`;
    }
  });

function displayPlayerDetails(playerData) {
  detailsArea.innerHTML = `
    <h2>Player Details</h2>
    <p><strong>Name:</strong> ${playerData.name || "N/A"}</p>
    <p><strong>Level:</strong> ${playerData.expLevel || "N/A"}</p>
    <p><strong>Clan:</strong> ${playerData.clan?.name || "No Clan"}</p>
  `;
}

document.getElementById("clearButton").addEventListener("click", () => {
  codeBox.value = "";
  detailsArea.innerHTML = "";
});
