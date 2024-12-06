document.getElementById('login-btn').addEventListener('click', () => {
    // Implement Google OAuth login
    chrome.identity.launchWebAuthFlow(
      {
        url: 'YOUR_AUTH_URL', // Replace with your auth URL
        interactive: true,
      },
      (redirectUri) => {
        // Handle the OAuth redirect and extract tokens
      }
    );
  });
  
  document.getElementById('start-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startRecording' });
  });
  
  document.getElementById('stop-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'stopRecording' });
  });
  