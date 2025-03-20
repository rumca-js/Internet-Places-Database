// library code

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let preparingData = false;


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
            ${currentPage} / ${totalPages} @ ${count} records.
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

    // const navbar = document.getElementById('navbar');
    // navbar.classList.remove('navbar-light', 'bg-dark');
    // navbar.classList.add('navbar-dark', 'bg-light');
}


function setDarkMode() {
    view_display_style = "style-dark";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-dark.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "dark");

    // const navbar = document.getElementById('navbar');
    // navbar.classList.remove('navbar-light', 'bg-light');
    // navbar.classList.add('navbar-dark', 'bg-dark');
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

    // Prepare progress bar and output
    //const progressBarElement = document.getElementById('progressBarElement');
    //progressBarElement.innerHTML = '';

    // Add progress bar to the progressBarElement div
    let percentComplete = 0;
    //const progressBarHTML = `
    //    <div class="progress">
    //        <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" 
    //            aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
    //            ${percentComplete}%
    //        </div>
    //    </div>
    //    <span class="status-text">Loading blob file...</span>
    //`;
    //progressBarElement.innerHTML = progressBarHTML;

    //const progressBar = progressBarElement.querySelector('.progress-bar');
    //const statusText = progressBarElement.querySelector('.status-text');

    try {
        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        let dataReady = null; // Placeholder for the data that will be processed
        
        for (const fileName of fileNames) {
            //statusText.innerText = `Reading: ${fileName}`;
            processedFiles++;
            percentComplete = Math.round((processedFiles / totalFiles) * 100);

            //progressBar.style.width = `${percentComplete}%`;
            //progressBar.setAttribute('aria-valuenow', `${percentComplete}`);
            //progressBar.innerText = `${percentComplete}%`;

            if (fileName.endsWith(extension)) {
                const dbFile = await zip.files[fileName].async(unpackAs);
                dataReady = dbFile;
                return dataReady;
            }
        }

        console.error("No database file found in the ZIP.");

        //statusText.innerText = "All files processed!";
    } catch (error) {
        console.error("Error reading ZIP file:", error);
        //progressBarElement.textContent = "Error processing ZIP file. Check console for details.";
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
    } else {
        if (jsonData && Array.isArray(jsonData))
        {
            object_list_data.entries.push(...jsonData);
        }
        else {
            console.error("jsonData.entries is either not defined or not an array.");
        }
    }
}

async function unPackFileJSONS(zip) {
   // Prepare progress bar and output
   //const progressBarElement = document.getElementById('progressBarElement');
   //progressBarElement.innerHTML = '';

    // Add progress bar to the progressBarElement div
    let percentComplete = 0;
    //const progressBarHTML = `
    //    <div class="progress">
    //        <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" 
    //            aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
    //            ${percentComplete}%
    //        </div>
    //    </div>
    //    <span class="status-text">Loading blob file...</span>
    //`;
    //progressBarElement.innerHTML = progressBarHTML;

    //const progressBar = progressBarElement.querySelector('.progress-bar');
    //const statusText = progressBarElement.querySelector('.status-text');

    try {
        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        for (const fileName of fileNames) {
            //statusText.innerText = `Reading: ${fileName}`;
            processedFiles++;
            percentComplete = Math.round((processedFiles / totalFiles) * 100);

            //progressBar.style.width = `${percentComplete}%`;
            //progressBar.setAttribute('aria-valuenow', `${percentComplete}`);
            //progressBar.innerText = `${percentComplete}%`;

            if (fileName.endsWith('.json')) {
                const jsonFile = await zip.files[fileName].async('string');
                const jsonData = JSON.parse(jsonFile);

                updateListData(jsonData);
            }
        }

    } catch (error) {
        console.error("Error reading ZIP file:", error);
        //progressBarElement.textContent = "Error processing ZIP file. Check console for details.";
    }
}


async function requestFileChunks(file_name, attempt = 1) {
    preparingData = true;

    //$("#progressBarElement").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading data...`);

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

                //$("#progressBarElement").html(`
                //  <div class="progress">
                //    <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
                //      ${percentComplete}%
                //    </div>
                //  </div>
                //`);

                chunks.push(value);
            }
        }

        const blob = new Blob(chunks);
        preparingData = false;

        return blob;
    } catch (error) {
        preparingData = false;
        console.error("Error in requestFileChunks:", error);
    }
}

async function requestFileChunksUintArray(file_name, attempt = 1) {
    preparingData = true;

    // Set up the progress bar element initially if it hasn't been set
    //if ($("#progressBarElement").children().length === 0) {
    //    $("#progressBarElement").html(`
    //        <div class="progress">
    //            <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
    //                0%
    //            </div>
    //        </div>
    //    `);
    //}

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

        // Create a Uint8Array with a size large enough to hold all chunks
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            if (value) {
                receivedBytes += value.length;
                const percentComplete = ((receivedBytes / totalSize) * 100).toFixed(2);

                //$("#progressBarElement").html(`
                //  <div class="progress">
                //    <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
                //      ${percentComplete}%
                //    </div>
                //  </div>
                //`);

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
        preparingData = false;

        return uint8Array;

    } catch (error) {
        preparingData = false;
        console.error("Error in requestFileChunks:", error);
        // Handle error and show a message in the progress bar or another UI element
    }
}


async function requestFile(fileName, attempt = 1) {
    fileName = fileName + "?i=" + getFileVersion();

    console.log("Requesting file: " + fileName);

    // Fetch the database file
    const response = await fetch(fileName);

    const buffer = await response.arrayBuffer();

    // Load the database
    return new Uint8Array(buffer);
}


async function requestFileChunksMultipart(file_name, attempt = 1) {
    let exists = await checkIfFileExists(file_name);
    if (exists) {
        return await requestFileChunks(file_name);
    }
    
    let numeric = 0;
    let chunks = [];
    
    while (true) {
        let partName = `${file_name}${String(numeric).padStart(2, '0')}`;
        let partExists = await checkIfFileExists(partName);
        
        if (!partExists) {
            break;
        }
        
        let chunk = await requestFileChunks(partName);
        chunks.push(chunk);
        numeric++;
    }
    
    if (chunks.length === 0) {
        throw new Error(`File ${file_name} does not exist in parts.`);
    }
    
    return new Blob(chunks);
}
