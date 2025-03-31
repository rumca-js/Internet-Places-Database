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

    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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


function getSpinnerText(text = 'Loading...') {
   return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`;
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


/** functions **/


function setLightMode() {
    view_display_style = "style-light";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     // TODO replace rsshistory with something else
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-light.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "light");

    const navbar = document.getElementById('navbar');
    navbar.classList.remove('navbar-dark', 'bg-dark');
    navbar.classList.add('navbar-light', 'bg-light');
}


function setDarkMode() {
    view_display_style = "style-dark";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-dark.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "dark");

    const navbar = document.getElementById('navbar');
    navbar.classList.remove('navbar-light', 'bg-light');
    navbar.classList.add('navbar-dark', 'bg-dark');
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
