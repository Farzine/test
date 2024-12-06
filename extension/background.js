chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension Installed');
  });
  
  // Listen for messages from popup or content scripts
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'checkTabType') {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            
            function isYouTubeVideo(url) {
                return url.includes('youtube.com') && url.includes('/watch?');
            }

            function isZoomMeeting(url) {
                return url.includes('zoom.us') && url.includes('/j/');
            }

            function isGoogleMeet(url) {
                return url.includes('meet.google.com');
            }

            let tabType = 'unknown'; // Default to unknown
            if (isYouTubeVideo(currentTab.url)) {
                tabType = 'youtube';
            } else if (isZoomMeeting(currentTab.url)) {
                tabType = 'zoom';
            } else if (isGoogleMeet(currentTab.url)) {
                tabType = 'google_meet';
            }

            sendResponse( tabType );
        });

        return true; // Required to indicate an async response
    }
});
  