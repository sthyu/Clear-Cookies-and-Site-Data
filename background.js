chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
 if (changeInfo.status === 'complete') {
  console.log("aaaaaa")
  chrome.storage.local.get('urls', (data) => {
    const urls = data.urls || [];
    console.log('url to detect', urls);
    urls.forEach((urlPattern) => {
      if (tab.url.includes(urlPattern)) {
        console.log("URL detected", urlPattern);

        //clearCookiesAndReload(tabId); // Attempts to clear cookies and reload (causes errors)
	clearCookies(tabId);

        clearOtherInfo(tabId);
      }
    });
  });
}
});

const tabsWithActionTaken = {};

//not used because of error
function clearCookiesAndReload(tabId) {
  if (tabsWithActionTaken[tabId]) {
    console.log("action taken already", tabsWithActionTaken)
    return; 
  }
  console.log("Clearing cookies for tab:", tabId);

  chrome.cookies.getAll({}, function (cookies) {
    console.log('Cookies:', cookies); 

    cookies.forEach(function (cookie, i) {
      let cookieUrl = "http";
      cookieUrl += (cookie.secure) ? 's' : '';
      cookieUrl += '://' + cookie.domain + cookie.path;

      
      chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name
      }, function (removedCookie) {
        console.log('Removed cookie:', removedCookie);  
      });
    });
  });
}

//find all cookie asynchronously 
async function getAllCookies(){
  return new Promise((resolve)=> {
     chrome.cookies.getAll({}, function (cookies) {
        resolve(cookies);
     });
  });
}

//remove cookie asynchronously 
async function removeCookie(cookie){
   return new Promise((resolve) => {
    chrome.cookies.remove(
      { url: getCookieUrl(cookie), name: cookie.name },
      function (details) {
        resolve(details);
      }
    );
  });
}

async function clearCookies(tabId){
  if (tabsWithActionTaken[tabId]) {
    console.log("action taken already", tabsWithActionTaken)
    return; 
  }
  console.log("Clearing cookies for tab:", tabId);
  const cookieList = await getAllCookies()
  console.log('Cookies:', cookieList);


  for (const cookie of cookieList) {
      await removeCookie(cookie);

  }
   console.log('Cookies AFTER REMOVAL:', cookieList);
}


async function clearOtherInfo(tabId) {
    await caches.keys().then(function (cacheNames) {
        cacheNames.forEach(function (cacheName) {
            caches.delete(cacheName);
        });
    });

    const dbNames = await new Promise((resolve) => {
        chrome.storage.local.get(null, function (data) {
            resolve(Object.keys(data).filter((key) => key.startsWith('_')));
        });
    });

    for (const dbName of dbNames) {
        await new Promise((resolve) => {
            chrome.storage.local.remove(dbName, resolve);
        });
    }

    //clear localStorage and sessionStorage using scripts (not used because of errors)
    //chrome.scripting.executeScript(tabId, {
    //    file: 'clear_storage.js'
    //});
}