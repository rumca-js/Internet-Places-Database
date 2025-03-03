
function getEntryTags(entry) {
    let tags_text = "";
    if (entry.tags && entry.tags.length > 0) {
        tags_text = entry.tags.map(tag => `#${tag}`).join(",");
    }
    return tags_text;
}


function isEntryValid(entry) {
    if (entry.is_valid === false || entry.date_dead_since) {
        return false;
    }
    return true;
}


function getEntryAuthorText(entry) {
    if (entry.author && entry.album)
    {
        return entry.author + " / " + entry.album;
    }
    else if (entry.author) {
        return entry.author;
    }
    else if (entry.album) {
        return entry.album;
    }
    return "";
}


/** templates **/


function entryStandardTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getVotesBadge(page_rating_votes);
    let badge_star = getBookmarkBadge(entry);
    let badge_age = getAgeBadge(entry);

    let bookmark_class = entry.bookmarked ? `list-group-item-primary` : '';
    let invalid_style = isEntryValid(entry) ? `` : `style="opacity: 0.5"`;

    let img_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        img_text = `<img src="{thumbnail}" class="rounded ${iconClass}" />`;
    }
    
    let thumbnail_text = '';
    if (img_text) {
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                ${img_text}
            </div>`;
    }
    let tags = `<div class="text-reset mx-2">{tags_text}</div>`;

    return `
        <a 
            href="{entry_link}"
            title="{hover_title}"
            ${invalid_style}
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
                ${thumbnail_text}
                <div class="mx-2">
                    <span style="font-weight:bold" class="text-reset">{title_safe}</span>
                    <div class="text-reset">
                        {source__title} {date_published}
                    </div>
                    ${tags}
                </div>

                <div class="mx-2 ms-auto">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
                </div>
            </div>
        </a>
    `;
}


function entrySearchEngineTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getVotesBadge(page_rating_votes);
    let badge_star = highlight_bookmarks ? getBookmarkBadge(entry) : "";
    let badge_age = getAgeBadge(entry);
   
    let invalid_style = isEntryValid(entry) ? `` : `style="opacity: 0.5"`;
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                <img src="{thumbnail}" class="rounded ${iconClass}"/>
            </div>`;
    }
    let tags = `<div class="text-reset mx-2">{tags_text}</div>`;

    return `
        <a 
            href="{entry_link}"
            title="{hover_title}"
            ${invalid_style}
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
               ${thumbnail_text}
               <div class="mx-2">
                  <span style="font-weight:bold" class="text-reset">{title_safe}</span>
                  <div class="text-reset text-decoration-underline">@ {link}</div>
                  ${tags}
               </div>

               <div class="mx-2 ms-auto">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
               </div>
            </div>
        </a>
    `;
}


function entryGalleryTemplate(entry, show_icons = true, small_icons = false) {
    if (isMobile()) {
        return entryGalleryTemplateMobile(entry, show_icons, small_icons);
    }
    else {
        return entryGalleryTemplateDesktop(entry, show_icons, small_icons);
    }
}


function entryGalleryTemplateDesktop(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;
    
    let badge_text = getVotesBadge(page_rating_votes, true);
    let badge_star = getBookmarkBadge(entry, true);
    let badge_age = getAgeBadge(entry, true);

    let invalid_style = isEntryValid(entry) ? `` : `opacity: 0.5`;

    let thumbnail = entry.thumbnail;
    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%;max-height:100%;aspect-ratio:3/4;object-fit:cover;"/>
        <div class="ms-auto">
            ${badge_text}
            ${badge_star}
            ${badge_age}
        </div>
    `;

    let tags = `<div class="text-reset mx-2">{tags_text}</div>`;

    return `
        <a 
            href="{entry_link}"
            title="{hover_title}"
            class="list-group-item list-group-item-action m-1 border rounded p-2"
            style="text-overflow: ellipsis; max-width: 18%; min-width: 18%; width: auto; aspect-ratio: 1 / 1; text-decoration: none; display:flex; flex-direction:column; ${invalid_style}"
        >
            <div style="display: flex; flex-direction:column; align-content:normal; height:100%">
                <div style="flex: 0 0 70%; flex-shrink: 0;flex-grow:0;max-height:70%">
                    ${thumbnail_text}
                </div>
                <div style="flex: 0 0 30%; flex-shrink: 0;flex-grow:0;max-height:30%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    <span style="font-weight: bold" class="text-primary">{title_safe}</span>
                    <div class="link-list-item-description">{source__title}</div>
                    ${tags}
                </div>
            </div>
        </a>
    `;
}


function entryGalleryTemplateMobile(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;
    
    let badge_text = getVotesBadge(page_rating_votes, true);
    let badge_star = getBookmarkBadge(entry, true);
    let badge_age = getAgeBadge(entry, true);

    let invalid_style = isEntryValid(entry) ? `` : `opacity: 0.5`;

    let thumbnail = entry.thumbnail;
    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%; max-height:100%; object-fit:cover"/>
        ${badge_text}
        ${badge_star}
        ${badge_age}
    `;

    let tags = `<div class="text-reset mx-2">{tags_text}</div>`;

    return `
        <a 
            href="{entry_link}"
            title="{hover_title}"
            class="list-group-item list-group-item-action border rounded p-2"
            style="text-overflow: ellipsis; max-width: 100%; min-width: 100%; width: auto; aspect-ratio: 1 / 1; text-decoration: none; display:flex; flex-direction:column; ${invalid_style}"
        >
            <div style="display: flex; flex-direction:column; align-content:normal; height:100%">
                <div style="flex: 0 0 70%; flex-shrink: 0;flex-grow:0;max-height:70%">
                    ${thumbnail_text}
                </div>
                <div style="flex: 0 0 30%; flex-shrink: 0;flex-grow:0;max-height:30%">
                    <span style="font-weight: bold" class="text-primary">{title_safe}</span>
                    <div class="link-list-item-description">{source__title}</div>
                    ${tags}
                </div>
            </div>
        </a>
    `;
}


/** fill functions **/


function fillOneEntry(entry) {
    if (entry.link) {
       return fillOneEntryLink(entry);
    }
    if (entry.url) {
       return fillOneEntrySource(entry);
    }
}


function getEntryListText(entries) {
    let htmlOutput = '';

    htmlOutput = `  <span class="container list-group">`;

    if (view_display_type == "gallery") {
        htmlOutput += `  <span class="d-flex flex-wrap">`;
    }

    if (entries && entries.length > 0) {
        entries.forEach((entry) => {
            const listItem = fillOneEntry(entry);

            if (listItem) {
                htmlOutput += listItem;
            }
        });
    } else {
        htmlOutput = '<li class="list-group-item">No entries found</li>';
    }

    if (view_display_type == "gallery") {
        htmlOutput += `</span>`;
    }

    htmlOutput += `</span>`;

    return htmlOutput;
}


function fillListDataInternal(entries) {
    $('#statusLine').html("Sorting links");

    var finished_text = getEntryListText(entries);

    $('#listData').html(finished_text);
}


function fillEntireListData() {
    let data = object_list_data;

    $('#listData').html("");

    let entries = data.entries;

    if (!entries || entries.length == 0) {
        $('#statusLine').html("No entries found");
        $('#listData').html("");
        $('#pagination').html("");
        return;
    }

    fillListDataInternal(entries);
    $('#statusLine').html("")
}


function fillSearchListData(searchText) {
    let data = object_list_data;

    $('#listData').html("");

    let entries = data.entries;

    if (!entries || entries.length == 0) {
        $('#statusLine').html("No entries found");
        $('#listData').html("");
        $('#pagination').html("");
        return;
    }

    $('#statusLine').html("Filtering links");
    let filteredEntries = entries.filter(entry =>
        isEntrySearchHit(entry, searchText)
    );

    if (filteredEntries.length === 0) {
        $('#statusLine').html("No matching entries found.");
        $('#listData').html("");
        $('#pagination').html("");
        return;
    }

    fillListDataInternal(filteredEntries);
    $('#statusLine').html("")
}


function fillListData() {
   fillEntireListData();
}


function searchInputFunction() {
    if (preparingData) {
        $("#statusLine").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Reading data...`);
        return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('page', 1);
    window.history.pushState({}, '', currentUrl);

    queryDatabase();
}


function getFileName() {
    let file_name = getQueryParam('file') || "internet";
    return file_name + ".db";
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


async function unPackFile(fileBlob) {
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

        const zip = await JSZip.loadAsync(fileBlob);

        const fileNames = Object.keys(zip.files);
        const totalFiles = fileNames.length;
        let processedFiles = 0;

        let dataReady = null; // Placeholder for the data that will be processed
        
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
                updateListData(jsonData); // Assuming this function is already defined to handle JSON data
            }

            // Here we are checking for the appropriate file type (assuming .db file) that we will use to create the SQL.Database
            if (fileName.endsWith('.db')) {
                const dbFile = await zip.files[fileName].async('uint8array');
                dataReady = dbFile;
            }
        }

        // Once all files are processed and data is ready, invoke the callback with the data
        if (dataReady) {
            return dataReady;
        } else {
            console.error("No database file found in the ZIP.");
        }

        statusText.innerText = "All files processed!";
    } catch (error) {
        console.error("Error reading ZIP file:", error);
        progressBarElement.textContent = "Error processing ZIP file. Check console for details.";
    }
}


async function requestFile(file_name, attempt = 1) {
    preparingData = true;

    $("#progressBarElement").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading data...`);

    try {
        const response = await fetch(file_name);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${url}, status:${response.statusText}`);
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

                $("#progressBarElement").html(`
                  <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${percentComplete}%" aria-valuenow="${percentComplete}" aria-valuemin="0" aria-valuemax="100">
                      ${percentComplete}%
                    </div>
                  </div>
                `);

                chunks.push(value);
            }
        }

        const blob = new Blob(chunks);

        return blob;
    } catch (error) {
        preparingData = false;
        console.error("Error in requestFile:", error);
    }
}


function getSelectColumns() {
    return "id, link, title, description, date_published, thumbnail, author, album, language, permanent, bookmarked, age, status_code, manual_status_code, page_rating, page_rating_votes, page_rating_contents";
}


function unpackResults(res) {
    results = [];

    if (res.length > 0) {
       const rows = res[0].values;
       
       rows.forEach(row => {
         let tags = selectEntryTags(row[0]);

         const data = {
           id: row[0],
           link: row[1],
           title: row[2],
           description: row[3],
           date_published: row[4],
           thumbnail: row[5],
           author: row[6],
           album: row[7],
           language: row[8],
           permanent: row[9],
           bookmarked: row[10],
           age: row[11],
           status_code: row[12],
           manual_status_code: row[13],
           page_rating: row[14],
           page_rating_votes: row[15],
           page_rating_contents: row[16],
           tags : tags,
         };

         results.push(data);
       });
    }

    return results;
}


function getOrderStmt() {
   let sort_method = sort_function;
   let order_method = "ASC";

   if (sort_function.startsWith("-")) {
      sort_method = sort_function.slice(1);
      order_method = "DESC";
   }

   return `ORDER BY ${sort_method} ${order_method}`;
}


let PAGE_SIZE = 100;


function getSelectEntry(entry_id) {
   let text = "SELECT " + getSelectColumns();
   text = text + ' FROM linkdatamodel';
   text = text + ` WHERE id = ${entry_id}`;

   return text;

}


function getSelectDefault() {
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectDefaultUserInput(userInput) {
   console.log(userInput);
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel WHERE title LIKE '%${userInput}%' OR link LIKE '%${userInput}%' OR description LIKE '%${userInput}%'`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectCustomSQL(userInput) {

   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel WHERE ${userInput}`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();
   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function performQuery(text) {
   console.log(text);

   const res = db.exec(text);

   object_list_data.entries = unpackResults(res);
}


function getQueryTotalRows(text) {
   const fromIndex = text.toUpperCase().indexOf('FROM');
   
   if (fromIndex === -1) {
       return 0;
   }
   
   const offsetIndex = text.toUpperCase().indexOf('OFFSET');
   
   if (offsetIndex !== -1) {
       text = text.slice(0, offsetIndex);
   }

   text = "SELECT COUNT(*) " + text.slice(fromIndex);

   console.log(text);

   const res = db.exec(text);

   if (res.length > 0) {
      const rows = res[0].values;

      if (rows.length > 0) {
          let size = rows[0][0];
          return size;
      }
   }

   return 0;
}


function queryDatabase() {

  if (!db) {
     console.log("queryDatabase - not initialized");
     return;
  }

  object_list_data = { entries: [] };

  try {
       let userInput = $("#searchInput").val();

       /* let userInput = getQueryParam("search"); */

       text = getSelectDefault(userInput);

       let entry_id = getQueryParam("entry_id");
       if (entry_id)
       {
          text = getSelectEntry(entry_id);
       }

       if (userInput && userInput != "") {
           if (userInput.indexOf("LIKE") !== -1) {
              text = getSelectCustomSQL(userInput);
           }
           else {
              text = getSelectDefaultUserInput(userInput);
           }
       }

       performQuery(text);
       fillListData();

       let total_rows = getQueryTotalRows(text);
       let page_num = parseInt(getQueryParam("page")) || 1;
       let nav_text = GetPaginationNav(page_num, total_rows/PAGE_SIZE, total_rows)
       $('#pagination').html(nav_text);
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:' + error;
  }
}


async function createDatabase(dbFileName) {
  if (db) {
     return;
  }

  console.log("createDatabase SQL");

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Fetch the database file
    const response = await fetch(dbFileName);
    const buffer = await response.arrayBuffer();

    // Load the database
    db = new SQL.Database(new Uint8Array(buffer));
    console.log("createDatabase DONE");
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:'+ error;
  }
}


async function createDatabaseData(dataArray) {
  if (db) {
     return;
  }

  console.log("createDatabase SQL");

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Load the database
    db = new SQL.Database(dataArray);
    console.log("createDatabase DONE");
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:'+ error;
  }
}


//-----------------------------------------------
$(document).on('click', '.btnNavigation', function(e) {
    console.log("btnNavigation");
    e.preventDefault();

    const currentPage = $(this).data('page');
    const currentUrl = new URL(window.location.href);

    currentUrl.searchParams.set('page', currentPage);

    window.history.pushState({}, '', currentUrl);

    $('html, body').animate({ scrollTop: 0 }, 'slow');

    queryDatabase();
});


//-----------------------------------------------
$(document).on('click', '#searchButton', function(e) {
    console.log("searchButton");
    searchInputFunction();
});


//-----------------------------------------------
$(document).on('click', '#helpButton', function(e) {
    console.log("helpButton");
    $("#helpPlace").toggle();
});

$(document).on('click', '#homeButton', function(e) {
    console.log("homeButton");
    let file_name = getFileName();

    const searchInput = document.getElementById('searchInput');
    searchInput.value = "";
    searchInput.focus();

    $('#listData').html("");
    $('#pagination').html("");

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('page')
    currentUrl.searchParams.delete('search')
    window.history.pushState({}, '', currentUrl);
});


//-----------------------------------------------
$(document).on('keydown', "#searchInput", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();

        searchInputFunction();
    }
});


//-----------------------------------------------
$(document).on('click', '#orderByVotes', function(e) {
    console.log("orderByVotes");
    if (sort_function == "-page_rating_votes")
    {
        sort_function = "page_rating_votes";
    }
    else
    {
        sort_function = "-page_rating_votes";
    }

    if (sort_function != "-page_rating_votes") {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('order', sort_function);
        window.history.pushState({}, '', currentUrl);
    }
    else {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('order'); // Remove the 'order' parameter
        window.history.pushState({}, '', currentUrl);
    }

    queryDatabase();
});


//-----------------------------------------------
$(document).on('click', '#orderByDatePublished', function(e) {
    if (sort_function == "date_published")
    {
        sort_function = "-date_published";
    }
    else
    {
        sort_function = "date_published";
    }

    if (sort_function != "-page_rating_votes") {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('order', sort_function);
        window.history.pushState({}, '', currentUrl);
    }
    else {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('order'); // Remove the 'order' parameter
        window.history.pushState({}, '', currentUrl);
    }

    queryDatabase();
});


//-----------------------------------------------
$(document).on('click', '#viewStandard', function(e) {
    view_display_type = "standard";
    fillListData();
});


//-----------------------------------------------
$(document).on('click', '#viewGallery', function(e) {
    view_display_type = "gallery";
    fillListData();
});


//-----------------------------------------------
$(document).on('click', '#viewSearchEngine', function(e) {
    view_display_type = "search-engine";
    fillListData();
});


$(document).on("click", '#displayLight', function(e) {
    setLightMode();

    fillListData();
});


$(document).on("click", '#displayDark', function(e) {
    setDarkMode();

    fillListData();
});


async function initAndQueryDatabase(dbFileName) {
  if (!object_list_data) {
    let spinner_text = getSpinnerText();

    const progressBarElement = document.getElementById('progressBarElement');
    progressBarElement.innerHTML = spinner_text;

    console.log(dbFileName);

    if (dbFileName.indexOf(".db")) {
       await createDatabase(dbFileName);
    }
    else {
       blob = requestFile(dbFileName);
       let data = await unPackFile(blob);
       await createDatabaseData(data);
    }

    queryDatabase();

    progressBarElement.innerHTML = '';
  }
}


document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');

    if (isMobile()) {
        searchInput.style.width = '100%';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    view_show_icons = urlParams.get("view_show_icons") || false;
    view_display_type = urlParams.get("view_display_type") || "search-engine";
    sort_function = urlParams.get('order') || "-page_rating_votes";
    default_page_size = parseInt(urlParams.get('default_page_size'), 10) || 100;

    if (searchParam) {
        searchInput.value = searchParam;
    }

    if (!object_list_data) {
	    let file_name = getFileName();
        initAndQueryDatabase(file_name);
    }
});


window.addEventListener("beforeunload", (event) => {
    console.log("beforeunload");
    if (preparingData) {
        // Custom message shown in some browsers
        event.preventDefault();
        event.returnValue = ''; // This will trigger the default confirmation dialog
    }
});
