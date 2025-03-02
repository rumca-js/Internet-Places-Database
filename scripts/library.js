// library code

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let preparingData = false;
let view_display_type = "search-engine";
let view_show_icons = false;
let view_small_icons = false;
let show_pure_links = true;
let highlight_bookmarks = false;
let object_list_data = null;
let sort_function = "-page_rating_votes"; // page_rating_votes, date_published
let default_page_size = 200;


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


function GetPaginationNav(currentPage, totalPages, count) {
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


function getVotesBadge(page_rating_votes, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 30px;" + style;
    }

    let badge_text = page_rating_votes > 0 ? `
        <span class="badge text-bg-warning" style="${style}">
            ${page_rating_votes}
        </span>` : '';

    return badge_text;
}


function getBookmarkBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 5px;" + style;
    }

    let badge_star = entry.bookmarked ? `
        <span class="badge text-bg-warning" style="${style}">
            ★
        </span>` : '';
    return badge_star;
}


function getAgeBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 5px;" + style;
    }

    let badge_text = entry.age > 0 ? `
        <span class="badge text-bg-warning" style="${style}">
            A
        </span>` : '';
    return badge_text;
}


function getDeadBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 30px;" + style;
    }

    let badge_text = entry.date_dead_since ? `
        <span class="badge text-bg-warning" style="${style}">
            D
        </span>` : '';
    return badge_text;
}


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


async function unPackFile(file) {
   // Prepare progress bar and output
   const progressBarElement = document.getElementById('progressBarElement');
   progressBarElement.innerHTML = '';

    // Add progress bar to the progressBarElement div
    let percentComplete = 0;
    const progressBarHTML = `
        <div class="progress">
            <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" 
                aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
                ${percentComplete}%
            </div>
        </div>
        <span class="status-text">Loading blob file...</span>
    `;
    progressBarElement.innerHTML = progressBarHTML;

    const progressBar = progressBarElement.querySelector('.progress-bar');
    const statusText = progressBarElement.querySelector('.status-text');

    try {
        const JSZip = window.JSZip;

        const zip = await JSZip.loadAsync(file);

        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        for (const fileName of fileNames) {
            statusText.innerText = `Reading: ${fileName}`;
            processedFiles++;
            percentComplete = Math.round((processedFiles / totalFiles) * 100);

            progressBar.style.width = `${percentComplete}%`;
            progressBar.setAttribute('aria-valuenow', `${percentComplete}`);
            progressBar.innerText = `${percentComplete}%`;

            if (fileName.endsWith('.json')) {
                const jsonFile = await zip.files[fileName].async('string');
                const jsonData = JSON.parse(jsonFile);

                updateListData(jsonData);
            }
        }

        fillListData();
        statusText.innerText = "All files processed!";
    } catch (error) {
        console.error("Error reading ZIP file:", error);
        progressBarElement.textContent = "Error processing ZIP file. Check console for details.";
    }
}


let db;

function queryDatabase() {
  //if (!object_list_data) {
      object_list_data = { entries: [] };
  //}

  if (!db) {
     console.log("queryDatabase - not initialized");
     return;
  }

  try {
    if (db) {
       const userInput = $("#searchInput").val();

       let text = "SELECT link, title, description, page_rating_votes";

       if (userInput != "") {
           if (userInput.indexOf("LIKE") === -1) {
             // Use LIKE to match userInput in any of the three columns
             text = text + ` FROM linkdatamodel WHERE title LIKE '%${userInput}%' OR link LIKE '%${userInput}%' OR description LIKE '%${userInput}%'`;
           } else {
             // If userInput contains '=', treat it as a full query condition
             text = text + ` FROM linkdatamodel WHERE ${userInput}`;
           }
       }
       else {
          text = text + ' FROM linkdatamodel';
       }

	text = text + " ORDER BY page_rating_votes DESC LIMIT 100";

       console.log("query " + text);

       const res = db.exec(text);

       if (res.length > 0) {
         const rows = res[0].values;
         
         rows.forEach(row => {
           const data = {
             link: row[0],
             title: row[1],
             description: row[2],
             page_rating_votes: row[3]
           };
           object_list_data.entries.push(data);
         });

         fillListData();
       }
       console.log("queryDatabase DONE");
    }
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
  }
}


async function requestFile(attempt = 1) {
  if (db) {
     return;
  }

  console.log("requestFile SQL");

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Fetch the database file
    const response = await fetch('/internet.db');
    const buffer = await response.arrayBuffer();

    // Load the database
    db = new SQL.Database(new Uint8Array(buffer));
    console.log("requestFile DONE");
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
  }
}
