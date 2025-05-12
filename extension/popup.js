document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const retrySection = document.getElementById('retrySection');
  const songInput = document.getElementById('songInput');
  const retryBtn = document.getElementById('retryBtn');
  const lyricsDiv = document.getElementById('lyrics');
  const BACKEND_URL = 'https://your-deployed-backend-url.com';

  // Load cached lyrics when popup opens
  chrome.storage.local.get(['cachedLyrics', 'currentSong'], function(result) {
    if (result.cachedLyrics) {
      lyricsDiv.textContent = result.cachedLyrics;
      if (result.currentSong) {
        songInput.value = result.currentSong;
      }
    }
  });

  generateBtn.addEventListener('click', async () => {
    try {
      // Get the current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Get the video title from the page using the correct selector
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          const titleElement = document.querySelector('yt-formatted-string.style-scope.ytd-watch-metadata');
          return titleElement ? titleElement.textContent : null;
        }
      });
      
      const videoTitle = result[0].result;
      if (!videoTitle) {
        lyricsDiv.textContent = "Could not find video title";
        return;
      }
      
      // Call the Python script with the video title
      const response = await fetch(`${BACKEND_URL}/generate_lyrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: videoTitle })
      });
      
      const data = await response.json();
      
      if (data.lyrics === "Could not find lyrics content") {
        lyricsDiv.textContent = "Could not find lyrics. Please enter the exact song name:";
        retrySection.style.display = 'block';
      } else {
        lyricsDiv.textContent = data.lyrics;
        retrySection.style.display = 'none';
        // Cache the lyrics and song name
        chrome.storage.local.set({
          cachedLyrics: data.lyrics,
          currentSong: videoTitle
        });
      }
    } catch (error) {
      lyricsDiv.textContent = 'Error: ' + error.message;
    }
  });
  

  retryBtn.addEventListener('click', async () => {
    try {
      const songName = songInput.value.trim();
      if (!songName) {
        lyricsDiv.textContent = "Please enter a song name";
        return;
      }

      const response = await fetch(`${BACKEND_URL}/generate_lyrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: songName, is_retry: true })
      });
      
      const data = await response.json();
      
      if (data.lyrics === "Could not find lyrics content") {
        lyricsDiv.textContent = "Still could not find lyrics. Please try a different song name.";
      } else {
        lyricsDiv.textContent = data.lyrics;
        retrySection.style.display = 'none';
        // Cache the lyrics and song name
        chrome.storage.local.set({
          cachedLyrics: data.lyrics,
          currentSong: songName
        });
        songInput.value = '';
      }
    } catch (error) {
      lyricsDiv.textContent = 'Error: ' + error.message;
    }
  });
});