// Global variable to store the generated lines for PDF
let generatedLines = [];
let jsPDFReady = false;

// Inject jsPDF script from your extension's local files
const script = document.createElement('script');
// Load from local path inside the extension
script.src = chrome.runtime.getURL('libs/jsPDF/dist/jspdf.umd.min.js');
script.onload = () => {
  console.log('jsPDF script loaded!');
  // Check if window.jspdf is defined
  if (window.jspdf && window.jspdf.jsPDF) {
    jsPDFReady = true;
    console.log('jsPDF is ready to use.');
  } else {
    console.error('jsPDF script loaded but window.jspdf is not defined. Check the file you are using.');
  }
};
(document.head || document.documentElement).appendChild(script);

chrome.runtime.sendMessage({ type: "checkTabType" }, function (response) {
  if (response) {
    setTimeout(function () {
      const tabType = response;

      if (tabType === "youtube") {
        // Locate the "Show transcript" button
        const showTranscriptButton = document.querySelector(
          "button[aria-label='Show transcript']"
        );

        if (showTranscriptButton) {
          showTranscriptButton.click();

          // Use MutationObserver to wait for the transcript container to load
          const observer = new MutationObserver(() => {
            const contentWrapper = document.querySelector(
              'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"] ytd-transcript-renderer #segments-container'
            );

            if (contentWrapper) {
              console.log("Transcript container found:", contentWrapper);
              // Stop observing once the target is found
              observer.disconnect();

              // Hide the original container
              contentWrapper.style.display = "none";

              // Create custom UI container and elements
              const mainDiv = document.createElement("div");
              mainDiv.style.cssText = `
                padding: 20px;
                background-color: #1d1d1d;
                border-radius: 12px;
                border: 1px solid #ffffff10;
                font-family: Arial, sans-serif;
                font-size: 15px;
                color: #ffffff;
                overflow-y: auto;
                max-height: 500px;
                position: fixed;
                top: 100px;
                right: 20px;
                width: 400px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                line-height: 1.6;
              `;

              const MainParagraph = document.createElement("div");
              MainParagraph.style.paddingTop = "20px";

              const toggleTabs = document.createElement("div");
              toggleTabs.style.display = "flex";
              toggleTabs.style.flexDirection = "row";
              toggleTabs.style.width = "100%";
              toggleTabs.style.marginTop = "20px";

              mainDiv.style.display = "flex";
              mainDiv.style.flexDirection = "column";

              // Create Summary Button
              const SummaryTab = document.createElement("button");
              SummaryTab.innerHTML = "Summary";
              SummaryTab.style.cssText = `
                padding: 6px 14px;
                border: none;
                border-radius: 20px;
                background-color: #2f2f2f;
                font-size: 15px;
                color: #ffffff;
                cursor: pointer;
                font-family: Arial, sans-serif;
                margin-right: 10px;
                transition: background-color 0.3s ease;
              `;
              SummaryTab.addEventListener('mouseover', () => {
                SummaryTab.style.backgroundColor = '#3c3c3c';
              });
              SummaryTab.addEventListener('mouseout', () => {
                SummaryTab.style.backgroundColor = '#2f2f2f';
              });

              // Click event to download as PDF
              SummaryTab.addEventListener('click', () => {
                if (!jsPDFReady) {
                  console.error("jsPDF is not available yet.");
                  return;
                }

                if (window.jspdf && window.jspdf.jsPDF) {
                  const { jsPDF } = window.jspdf;
                  const doc = new jsPDF();
                  doc.setFont("helvetica", "");
                  doc.setFontSize(12);

                  // Add each line to the PDF
                  generatedLines.forEach((line, index) => {
                    doc.text(`${index + 1}. ${line}`, 10, 20 + index * 10);
                  });

                  doc.save("summary.pdf");
                } else {
                  console.error("jsPDF not found on window. Check injection.");
                }
              });

              // Create Chat Button
              const ChatTab = document.createElement("button");
              ChatTab.innerHTML = "Chat";
              ChatTab.style.cssText = `
                padding: 6px 14px;
                border: none;
                border-radius: 20px;
                background-color: #2f2f2f;
                font-size: 15px;
                color: #ffffff;
                cursor: pointer;
                font-family: Arial, sans-serif;
                transition: background-color 0.3s ease;
              `;
              ChatTab.addEventListener('mouseover', () => {
                ChatTab.style.backgroundColor = '#3c3c3c';
              });
              ChatTab.addEventListener('mouseout', () => {
                ChatTab.style.backgroundColor = '#2f2f2f';
              });

              mainDiv.appendChild(MainParagraph);
              mainDiv.appendChild(toggleTabs);
              toggleTabs.appendChild(SummaryTab);
              toggleTabs.appendChild(ChatTab);

              // Insert the UI into the DOM
              document.body.appendChild(mainDiv);

              // Extract the transcript from the page
              let transcript = [];
              const transcriptSegments = contentWrapper.querySelectorAll(
                "ytd-transcript-segment-renderer"
              );

              if (transcriptSegments && transcriptSegments.length > 0) {
                transcriptSegments.forEach((segment) => {
                  const formattedStrings = segment.querySelectorAll(
                    "yt-formatted-string"
                  );
                  formattedStrings.forEach((string) =>
                    transcript.push(string.innerText)
                  );
                });
              } else {
                console.error("No transcript segments found inside #segments-container.");
              }

              console.log("Transcript:", transcript);

              // Send the transcript to your backend
              fetch("http://localhost:3000/api/transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript })
              })
                .then(res => res.json())
                .then(data => {
                  const { generatedText } = data;
                  if (generatedText) {
                    const lines = generatedText.split('\n');
                    // Save the lines globally so we can generate a PDF on click
                    generatedLines = lines.map(line => line.replace(/^\d+\.\s*/, '').trim());

                    const ol = document.createElement('ol');
                    generatedLines.forEach(line => {
                      const li = document.createElement('li');
                      li.textContent = line;
                      ol.appendChild(li);
                    });
                    MainParagraph.appendChild(ol);
                  }
                });
            } else {
              console.log("Waiting for #segments-container...");
            }
          });

          // Start observing the body for changes
          observer.observe(document.body, { childList: true, subtree: true });
        } else {
          console.error("Show transcript button not found.");
        }
      } else if (tabType === "zoom") {
        console.log("Zoom Meeting");
      } else if (tabType === "google_meet") {
        console.log("Google Meet");
      } else {
        console.log("Unknown tab type.");
      }
    }, 1000); // Adjust timeout as needed
  } else {
    console.log("No response from background.js");
  }
});
