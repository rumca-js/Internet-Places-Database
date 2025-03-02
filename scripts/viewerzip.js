
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


function getEntryListText(entries, startIndex = 0, endIndex = 1000) {
    let htmlOutput = '';

    htmlOutput = `  <span class="container list-group">`;

    if (view_display_type == "gallery")
    {
        htmlOutput += `  <span class="d-flex flex-wrap">`;
    }

    if (entries && entries.length > 0) {
        entries.slice(startIndex, endIndex).forEach((entry, i) => {
            const listItem = fillOneEntry(entry);

            if (listItem) {
                htmlOutput += listItem;
            }
        });
    } else {
        htmlOutput = '<li class="list-group-item">No entries found</li>';
    }

    if (view_display_type == "gallery")
    {
        htmlOutput += `</span>`;
    }

    htmlOutput += `</span>`;

    return htmlOutput;
}


function fillListDataInternal(entries) {
    $('#statusLine').html("Sorting links");

    if (sort_function == "page_rating_votes") {
        entries = entries.sort((a, b) => {
            return a.page_rating_votes - b.page_rating_votes;
        });
    }
    else if (sort_function == "-page_rating_votes") {
        entries = entries.sort((a, b) => {
            return b.page_rating_votes - a.page_rating_votes;
        });
    }
    else if (sort_function == "date_published") {
        entries = entries.sort((a, b) => {
            if (a.date_published === null && b.date_published === null) {
                return 0;
            }
            if (a.date_published === null) {
                return 1;
            }
            if (b.date_published === null) {
                return -1;
            }
            return new Date(b.date_published) - new Date(a.date_published);
        });
    }
    else if (sort_function == "-date_published") {
        entries = entries.sort((a, b) => {
            if (a.date_published === null && b.date_published === null) {
                return 0;
            }
            if (a.date_published === null) {
                return -1;
            }
            if (b.date_published === null) {
                return 1;
            }
            return new Date(a.date_published) - new Date(b.date_published);
        });
    }

    let page_num = parseInt(getQueryParam("page")) || 1;
    let page_size = default_page_size;
    let countElements = entries.length;

    let start_index = (page_num-1) * page_size;
    let end_index = page_num * page_size;

    var finished_text = getEntryListText(entries, start_index, end_index);

    $('#listData').html(finished_text);
    $('#pagination').html(GetPaginationNav(page_num, countElements/page_size, countElements));
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
    console.log("searchInputFunction");

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


function getSelectColumns() {
    return "id, link, title, description, date_published, author, album, language, permanent, bookmarked, age, status_code, manual_status_code, page_rating, page_rating_votes, page_rating_contents";
}

function unpackResults(res) {
    results = [];

    if (res.length > 0) {
       const rows = res[0].values;
       
       rows.forEach(row => {
         const data = {
           id: row[0],
           link: row[1],
           title: row[2],
           description: row[3],
           date_published: row[4],
           author: row[5],
           album: row[6],
           language: row[7],
           permanent: row[8],
           bookmarked: row[9],
           age: row[10],
           status_code: row[11],
           manual_status_code: row[12],
           page_rating: row[13],
           page_rating_votes: row[14],
           page_rating_contents: row[15],
         };
         results.push(data);
       });
    }

    return results;
}


function queryDatabase() {

  if (!db) {
     console.log("queryDatabase - not initialized");
     return;
  }

  object_list_data = { entries: [] };

  try {
       let entry_id = getQueryParam("entry_id");
       if (entry_id)
       {
	  let text = "SELECT " + getSelectColumns();
          text = text + ' FROM linkdatamodel';
	  text = text + ` WHERE id = ${entry_id}`;

	  console.log(text);

          const res = db.exec(text);

          results = unpackResults(res);
          object_list_data.entries = results;
          fillListData();

          return;
       }


       let userInput = $("#searchInput").val();
       /* let userInput = getQueryParam("search"); */

       let text = "SELECT " + getSelectColumns();

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

       let page = getQueryParam("page") || 1;
       const offset = (page - 1) * 100;

       text = text + ` ORDER BY page_rating_votes DESC LIMIT 100 OFFSET ${offset}`;

       console.log("query " + text);

       const res = db.exec(text);

       results = unpackResults(res);
       object_list_data.entries = results;

       fillListData();
       console.log("queryDatabase DONE");
  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:' + error;
  }
}


async function requestFile(dbFileName) {
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
    const response = await fetch(dbFileName);
    const buffer = await response.arrayBuffer();

    // Load the database
    db = new SQL.Database(new Uint8Array(buffer));
    console.log("requestFile DONE");
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

    await requestFile(dbFileName);
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
