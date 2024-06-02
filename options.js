document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addBtn');
  const urlInput = document.getElementById('url');
  const urlsList = document.getElementById('urlsList');

  addBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      chrome.storage.local.get('urls', (data) => {
        const urls = data.urls || [];
        urls.push(url);
        chrome.storage.local.set({ urls });
        urlInput.value = '';
        displayUrls(urls);
      });
    }
  });

  function displayUrls(urls) {
    urlsList.innerHTML = '';
    urls.forEach((url, index) => {
      const li = document.createElement('li');
      li.textContent = url;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        urls.splice(index, 1);
        chrome.storage.local.set({ urls });
        displayUrls(urls);
      });

      li.appendChild(deleteBtn);
      urlsList.appendChild(li);
    });
  }

  chrome.storage.local.get('urls', (data) => {
    const urls = data.urls || [];
    displayUrls(urls);
  });

});