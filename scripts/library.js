// library code

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}


function escapeHtml(unsafe)
{
    if (unsafe == null)
        return "";

    unsafe = String(unsafe);

    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


function hexToRgb(hex) {
    // Remove "#" if present
    hex = hex.replace(/^#/, "");

    // Parse shorthand format (#RGB)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
}



class UrlLocation {
  constructor(urlString) {
    try {
      this.url = new URL(urlString);
    } catch (e) {
      throw new Error("Invalid URL");
    }
  }

  getProtocolless() {
    return sanitizeLink(this.url.href.replace(`${this.url.protocol}//`, ''));
  }

  getDomain() {
    const protocolless = this.getProtocolless();
    const firstSlashIndex = protocolless.indexOf('/');
    if (firstSlashIndex === -1) {
      return protocolless;
    }
    return protocolless.substring(0, firstSlashIndex);
  }
}


function createLinks(inputText) {
    const urlRegex = /(?<!<a[^>]*>)(https:\/\/[a-zA-Z0-9-_\.\/]+)(?!<\/a>)/g;
    const urlRegex2 = /(?<!<a[^>]*>)(http:\/\/[a-zA-Z0-9-_\.\/]+)(?!<\/a>)/g;

    inputText = inputText.replace(urlRegex, (match, url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    inputText = inputText.replace(urlRegex2, (match, url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    return inputText;
}

function isEmpty( el ){
    return !$.trim(el.html())
}


function getSpinnerText(text = 'Loading...') {
   return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`;
}


function animateToTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}


function putSpinnerOnIt(button) {
    button.prop("disabled", true);

    button.html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );

    button.parents('form').submit();
}


function GetPaginationNav(currentPage, totalPages, totalRows) {
    totalPages = Math.ceil(totalPages);

    if (totalPages <= 1) {
        return '';
    }

    let paginationText = `
        <nav aria-label="Page navigation">
            <ul class="pagination">
    `;

    const currentUrl = new URL(window.location);
    currentUrl.searchParams.delete('page');
    const paginationArgs = `${currentUrl.searchParams.toString()}`;

    if (currentPage > 2) {
        paginationText += `
            <li class="page-item">
                <a href="?page=1&${paginationArgs}" data-page="1" class="btnNavigation page-link">|&lt;</a>
            </li>
        `;
    }
    if (currentPage > 2) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${currentPage - 1}&${paginationArgs}" data-page="${currentPage - 1}" class="btnNavigation page-link">&lt;</a>
            </li>
        `;
    }

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        paginationText += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a href="?page=${i}&${paginationArgs}" data-page="${i}" class="btnNavigation page-link">${i}</a>
            </li>
        `;
    }

    if (currentPage + 1 < totalPages) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${currentPage + 1}&${paginationArgs}" data-page="${currentPage + 1}" class="btnNavigation page-link">&gt;</a>
            </li>
        `;
    }
    if (currentPage + 1 < totalPages) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${totalPages}&${paginationArgs}" data-page="${totalPages}" class="btnNavigation page-link">&gt;|</a>
            </li>
        `;
    }

    paginationText += `
            </ul>
            ${currentPage} / ${totalPages} @ ${totalRows} records.
        </nav>
    `;

    return paginationText;
}


function GetPaginationNavSimple(currentPage) {
    let paginationText = `
        <nav aria-label="Page navigation">
            <ul class="pagination">
    `;

    const currentUrl = new URL(window.location);
    currentUrl.searchParams.delete('page');
    const paginationArgs = `${currentUrl.searchParams.toString()}`;

    if (currentPage > 1) {
        paginationText += `
            <li class="page-item">
                <a href="?page=1&${paginationArgs}" data-page="1" class="btnNavigation page-link">|&lt;</a>
            </li>
        `;
    }
    if (currentPage > 1) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${currentPage - 1}&${paginationArgs}" data-page="${currentPage - 1}" class="btnNavigation page-link">&lt;</a>
            </li>
        `;
    }

    paginationText += `
        <li class="page-item">
            <a href="?page=${currentPage + 1}&${paginationArgs}" data-page="${currentPage + 1}" class="btnNavigation page-link">&gt;</a>
        </li>
    `;

    paginationText += `
            </ul>
            Page: ${currentPage}
        </nav>
    `;

    return paginationText;
}


function getHumanReadableNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + "B"; // Billions
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + "M"; // Millions
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + "K"; // Thousands
    }
    return num.toString(); // Small numbers
}


/**
 * Returns date in Locale
 */
function parseDate(inputDate) {
    return inputDate.toLocaleString();
}


/**
 * Returns date in known format
 */
function getFormattedDate(input_date) {
    let dateObject = input_date ? new Date(input_date) : new Date();

    let formattedDate = dateObject.getFullYear() + "-" +
        String(dateObject.getMonth() + 1).padStart(2, "0") + "-" +
        String(dateObject.getDate()).padStart(2, "0") + " " +
        String(dateObject.getHours()).padStart(2, "0") + ":" +
        String(dateObject.getMinutes()).padStart(2, "0") + ":" +
        String(dateObject.getSeconds()).padStart(2, "0");

    return formattedDate;
}


class InputContent {
  constructor(text) {
    this.text = text;
  }

  htmlify() {
    this.text = this.stripHtmlAttributes();
    this.text = this.linkify("https://");
    this.text = this.linkify("http://");
    return this.text;
  }

  stripHtmlAttributes() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.text, "text/html");

    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === "a") {
          const href = node.getAttribute("href");
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
          if (href) node.setAttribute("href", href);
        } else if (node.tagName.toLowerCase() === "img") {
          const src = node.getAttribute("src");
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
          if (src) node.setAttribute("src", src);
        } else {
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
        }
      }
      for (let child of node.childNodes) {
        walk(child);
      }
    };

    walk(doc.body);
    return doc.body.innerHTML;
  }

  linkify(protocol = "https://") {
    let text = this.text;

    if (!text.includes(protocol)) {
        return text;
    }

    let result = "";
    let i = 0;

    while (i < text.length) {
        const pattern = new RegExp(`${protocol}\\S+(?![\\w.])`);
        const match = text.slice(i).match(pattern);

        if (match && match.index === 0) {
            const url = match[0];
            const precedingChars = text.slice(Math.max(0, i - 10), i);

            if (!precedingChars.includes('<a href="') && !precedingChars.includes("<img")) {
                result += `<a href="${url}">${url}</a>`;
            } else {
                result += url;
            }

            i += url.length;
        } else {
            result += text[i];
            i += 1;
        }
    }

    return result;
  }
}


/**
 * services
 */


function fixStupidGoogleRedirects(input_url) {
    if (!input_url) {
        return null;
    }

    if (input_url.includes("www.google.com/url")) {
        const url = new URL(input_url);
        let realURL = url.searchParams.get('q');
        if (realURL) {
            return realURL;
        }
        realURL = url.searchParams.get('url');
        if (realURL) {
            return realURL;
        }
        return input_url;
    }

    return input_url;
}


function fixStupidYoutubeRedirects(input_url) {
    if (!input_url) {
        return null;
    }

    if (input_url.includes("www.youtube.com/redirect")) {
        const url = new URL(input_url);
        let redirectURL = url.searchParams.get('q');

        if (redirectURL) {
            return decodeURIComponent(redirectURL);
        }
        else {
            return input_url;
        }
    }

    return input_url;
}

function fixStupidMicrosoftSafeLinks(input_url) {
    if (!input_url) {
        return null;
    }

    try {
        const parsedUrl = new URL(input_url);

        if (parsedUrl.hostname.endsWith("safelinks.protection.outlook.com")) {
            const originalUrl = parsedUrl.searchParams.get("url");

            if (originalUrl) {
                return decodeURIComponent(originalUrl);
            }
        }
    } catch (e) {
    }

    return input_url;
}


function sanitizeLinkGeneral(link) {
   link = link.trimStart();

   // link can be inserted by hand, so someone might enter / at the end
   //if (link.endsWith("/")) {
   //   link = link.slice(0, -1);
   //}
   if (link.endsWith(" ")) {
      link = link.slice(0, -1);
   }

   return link;
}


function sanitizeLink(link) {
   link = sanitizeLinkGeneral(link);
   link = fixStupidGoogleRedirects(link);
   link = fixStupidYoutubeRedirects(link);
   link = fixStupidMicrosoftSafeLinks(link);
   link = sanitizeLinkGeneral(link);

   return link;
}


function isSocialMediaSupported(entry) {
    let page = new UrlLocation(entry.link)
    let domain = page.getDomain()
    if (!domain) {
        return false;
    }

    if (domain.includes("youtube.com")) {
        return true;
    }
    if (domain.includes("github.com")) {
        return true;
    }
    if (domain.includes("reddit.com")) {
        return true;
    }
    if (domain.includes("news.ycombinator.com")) {
        return true;
    }

    return false
}


async function checkIfFileExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error checking if database exists:", error);
        return false;
    }
}


async function unPackFile(zip, fileBlob, extension=".db", unpackAs='uint8array') {
    console.log("unPackFile");

    let percentComplete = 0;

    try {
        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        let dataReady = null; // Placeholder for the data that will be processed
        
        for (const fileName of fileNames) {
            processedFiles++;
            percentComplete = Math.round((processedFiles / totalFiles) * 100);

            // You can put some progressbar here

            if (fileName.endsWith(extension)) {
                const dbFile = await zip.files[fileName].async(unpackAs);
                dataReady = dbFile;
                return dataReady;
            }
        }

        console.error("No database file found in the ZIP.");
    } catch (error) {
        console.error("Error reading ZIP file:", error);
    }
}


async function requestFileChunks(file_name, attempt = 1) {
    file_name = file_name + "?i=" + getFileVersion();
    console.log("Requesting file chunks: " + file_name);

    try {
        const response = await fetch(file_name);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${file_name}, status:${response.statusText}`);
        }

        const contentLength = response.headers.get("Content-Length");
        const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedBytes = 0;

        const chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            if (value) {
                receivedBytes += value.length;
                const percentComplete = ((receivedBytes / totalSize) * 100).toFixed(2);

		// You can put some progressbar here

                chunks.push(value);
            }
        }

        const blob = new Blob(chunks);

        return blob;
    } catch (error) {
        console.error("Error in requestFileChunks:", error);
    }
}

async function requestFileChunksUintArray(file_name, attempt = 1) {
    file_name = file_name + "?i=" + getFileVersion();
    console.log("Requesting file: " + file_name);

    try {
        const response = await fetch(file_name);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${file_name}, status: ${response.statusText}`);
        }

        const contentLength = response.headers.get("Content-Length");
        const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = response.body.getReader();
        let receivedBytes = 0;

        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            if (value) {
                receivedBytes += value.length;
                const percentComplete = ((receivedBytes / totalSize) * 100).toFixed(2);

                // Use the percentComplete for a progress bar update here

                chunks.push(value);
            }
        }

        // Combine all chunks into a single Uint8Array
        const totalBytes = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const uint8Array = new Uint8Array(totalBytes);

        let offset = 0;
        for (const chunk of chunks) {
            uint8Array.set(chunk, offset);
            offset += chunk.length;
        }

        return uint8Array;

    } catch (error) {
        console.error("Error in requestFileChunks:", error);
    }
}


async function requestFile(fileName, attempt = 1) {
    fileName = fileName + "?i=" + getFileVersion();

    console.log("Requesting file: " + fileName);

    const response = await fetch(fileName);
    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${fileName}, status: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();

    return new Uint8Array(buffer);
}


async function getFilePartsList(file_name) {
    let numeric = 0;
    let parts = [];

    let exists = await checkIfFileExists(file_name);
    if (exists) {
        parts.push(file_name);
        return parts;
    }
    
    while (true) {
        let partName = `${file_name}${String(numeric).padStart(2, '0')}`;
        let partExists = await checkIfFileExists(partName);
        
        if (!partExists) {
            break;
        }
        
        parts.push(partName);
        numeric++;
    }
    
    return parts;
}


async function requestFileChunksFromList(parts) {
    let chunks = [];
    
    for (let part of parts) {
        let chunk = await requestFileChunks(part);
        chunks.push(chunk);
    }
    
    return new Blob(chunks);
}


async function requestFileChunksMultipart(file_name) {
    let chunks = await getFilePartsList(file_name);

    return await requestFileChunksFromList(chunks);
}


/**
 Specific
*/


function updateListData(jsonData) {
    if (!object_list_data) {
        object_list_data = { entries: [] };
    }

    if (!object_list_data.entries) {
        object_list_data.entries = [];
    }

    if (jsonData && Array.isArray(jsonData.entries)) {
        object_list_data.entries.push(...jsonData.entries);
    } else if (jsonData && Array.isArray(jsonData)) {
        object_list_data.entries.push(...jsonData);
    } else {
        console.error("Invalid JSON data: jsonData.entries is either not defined or not an array.");
    }
}

async function unPackFileJSONS(zip) {
    let percentComplete = 0;

    try {
        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        for (const fileName of fileNames) {
            processedFiles++;
            percentComplete = Math.round((processedFiles / totalFiles) * 100);

            // You can put some progressbar here

            if (fileName.endsWith('.json')) {
                const jsonFile = await zip.files[fileName].async('string');
                const jsonData = JSON.parse(jsonFile);

                updateListData(jsonData);
            }
        }

    } catch (error) {
        console.error("Error reading ZIP file:", error);
    }
}


/*
module.exports = {
    UrlLocation,
    sanitizeLink,
    fixStupidGoogleRedirects,
    fixStupidYoutubeRedirects,
    fixStupidMicrosoftSafeLinks,
    getYouTubeVideoId,
    getYouTubeChannelId,
    getChannelUrl,
    getOdyseeVideoId,
};
*/
