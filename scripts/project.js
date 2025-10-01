
let all_entries = null;
let entries_length = 0;
let search_suggestions = [];


function getFileName() {
    let file_name = getQueryParam('file') || getDefaultFileName();

    let adir = getDefaultFileLocation();

    if (file_name.indexOf(".zip") === -1 && file_name.indexOf(".db") === -1)
        file_name = file_name + ".zip";

    if (file_name.indexOf(adir) === -1)
        file_name = adir + file_name

    return file_name;
}


function getSearchSuggestsions() {
   let initial_search_suggestions = getInitialSearchSuggestsions();

   return [...search_suggestions, ...initial_search_suggestions];
}


function animateToTop() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}


function isWorkerNeeded(fileName) {
    if (fileName.indexOf("db") != -1 || fileName.indexOf("db.zip") != -1) {
        return true;
    }
    return false;
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

    fillAllEntriesSocialData(entries);

    $('#statusLine').html("")
}


function fillAllEntriesSocialData(entries) {
    entries.forEach(entry => {
       FillSocialData(entry.id, entry);
    });
}


function fillListDataInternal(entries) {
    var finished_text = getEntriesList(entries);

    $('#listData').html(finished_text);
}


function filterEntries(entries, searchText) {
    let filteredEntries = entries.filter(entry =>
        isEntrySearchHit(entry, searchText)
    );

    return filteredEntries;
}


function fillListData() {
   console.log("fillListData");
   fillEntireListData();
}


function getPaginationText() {
    let page_num = parseInt(getQueryParam("page")) || 1;
    let page_size = default_page_size;
    let countElements = entries_length;

    return GetPaginationNav(page_num, countElements/page_size, countElements);
}


function getProjectListText() {
    let files = getFileList();
    
    let html = `
        <div id="projectList">
            <h3>Projects</h3>
    `;
    
    files.forEach(file => {
        //let projectName = file.replace(".zip", "");
        let projectName = file;
        html += `<a class="btn btn-secondary projectButton" href="/${projectName}">${projectName}</a>`;
    });
    
    html += `</div>`;
    
    return html;
}


function getProjectListTextNav() {
    let files = getFileList();
    
    let html = ``;
    
    files.forEach(file => {
        //let projectName = file.replace(".zip", "");
        let projectName = file;
        html += `<li><a class="dropdown-item projectButton" href="/${projectName}">${projectName}</a></li>`;
    });
    
    return html;
}


function getSearchSuggestionContainer() {
    const suggestions = getSearchSuggestsions();
    let listItems = suggestions.map(suggestion =>
        `<li class="list-group-item suggestion-item" data-search="${suggestion}">🔍${suggestion}</li>`
    ).join("");

    let html = `
        <div id="search-suggestions" class="mt-2" style="display:none;">
            <ul class="list-group" id="suggestion-list">
               ${listItems}
            </ul>
        </div>
    `;
    return html;
}


function getNavBar() {
    let project_text = getProjectListTextNav();

    let nav_text = `
    <nav id="navbar" class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
      <div class="d-flex w-100">
        <!-- Form with search input -->
        <form class="d-flex w-100 ms-3" id="searchContainer">
          <div class="input-group">
            <input id="searchInput" class="form-control me-1 flex-grow-1" type="search" placeholder="Search" autofocus aria-label="Search">
            <button id="dropdownButton" class="btn btn-outline-secondary" type="button">⌄</button>
            <button id="searchButton" class="btn btn-outline-success" type="submit">🔍</button>
          </div>
        </form>

        <!-- Navbar toggler button, aligned to the right -->
        <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>
    
      <div class="collapse navbar-collapse ms-3" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a id="homeButton" class="nav-link" href="#">🏠</a>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Files
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                ${project_text}
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarViewDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              View
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarViewDropdown">
                <li><a id="viewStandard" class="dropdown-item" href="#">Standard</a></li>
                <li><a id="viewGallery" class="dropdown-item" href="#">Gallery</a></li>
                <li><a id="viewSearchEngine" class="dropdown-item" href="#">Search engine</a></li>

                <li><hr class="dropdown-divider"></li>

                <li><a id="displayLight" class="dropdown-item" href="#">Light</a></li>
                <li><a id="displayDark" class="dropdown-item" href="#">Dark</a></li>

                <li><hr class="dropdown-divider"></li>

                <li><a id="orderByVotes" class="dropdown-item" href="#">Order by Votes</a></li>
                <li><a id="orderByDatePublished" class="dropdown-item" href="#">Order by Date published</a></li>

                <li><hr class="dropdown-divider"></li>

                <li><a id="showIcons" class="dropdown-item" href="#">Show icons</a></li>
                <li><a id="hideIcons" class="dropdown-item" href="#">Hide icons</a></li>

                <li><hr class="dropdown-divider"></li>

                <li><a id="directLinks" class="dropdown-item" href="#" title="Links lead directly to URL">Direct links</a></li>
                <li><a id="localPreview" class="dropdown-item" href="#" title="Links lead to local preview">Local preview</a></li>
            </ul>
          </li>

          <li class="nav-item">
            <a id="helpButton" class="nav-link" href="#">?</a>
          </li>
        </ul>
      </div>
    </nav>
    `;

    let suggestions = getSearchSuggestionContainer();

    return nav_text + " " + suggestions;
}


function sortAndFilter() {
    console.log("sortAndFilter");

    const search_text = $("#searchInput").val();

    let entries = all_entries.entries;

    entries = sortEntries(entries);

    if (search_text != "") {
       entries = filterEntries(entries, search_text);
    }

    entries_length = entries.length;

    let page_num = parseInt(getQueryParam("page")) || 1;
    let page_size = default_page_size;

    let start_index = (page_num-1) * page_size;
    let end_index = page_num * page_size;

    object_list_data.entries = entries.slice(start_index, end_index);
}


function performSearchJSON() {
    if (!system_initialized) {
        $("#statusLine").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Reading data...`);
        return;
    }

    let entry_id = getQueryParam("entry_id");

    if (entry_id) {
       setEntryIdAsListData(entry_id);
    }
    else {
       sortAndFilter();

       fillListData();

       $('#pagination').html(getPaginationText());
    }
}


function performSearchDb() {
    if (!worker) {
        $('#statusLine').html("Worker problem");
        return;
    }
    if (!system_initialized) {
        $('#statusLine').html("Cannot make query - database is not ready");
    }

    let spinner_text = getSpinnerText("Searching");
    $('#statusLine').html(spinner_text);

    let query = getQueryText();
    console.log("Sent entries message: " + query);
    worker.postMessage({ type:"entries", query:query });

    console.log("Sent pagination message: " + query);
    worker.postMessage({ type:"pagination", query:query });
}


function performSearch() {
    let file_name = getFileName();

    const userInput = $("#searchInput").val();
    if (userInput.trim() != "") {
        document.title = userInput;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('search', userInput);
    window.history.pushState({}, '', currentUrl);

    if (isWorkerNeeded(file_name)) {
       return performSearchDb();
    }
    else {
       return performSearchJSON();
    }
}


function setEntryIdAsListData(entry_id) {
    let entry = getEntry(entry_id);
    setEntryAsListData(entry);
}


function setEntryAsListData(entry) {
    if (entry) {
       let entry_detail_text = getEntryDetailText(entry);
       let data = `<a href="" class="btn btn-primary go-back-button m-1">Go back</a>`;
       data += `<a href="" class="btn btn-primary copy-link m-1">Copy Link</a>`;
       data += entry_detail_text;
       $("#listData").html(data);
       $('#pagination').html("");

       document.title = entry.title;
    }
    else {
       $("#statusLine").html("Invalid entry");
    }
}


async function InitializeForDb() {
  if (!object_list_data) {
    if (!worker) {
       initWorker();
    }
  }
}


async function InitializeForJSON() {
   let file_name = getFileName();
   system_initialized = false;
   let spinner_text_1 = getSpinnerText("Initializing - reading file");
   console.log("Initializing - reading file");
   $("#statusLine").html(spinner_text_1);
   let chunks = await getFilePartsList(file_name);
   if (!chunks || chunks.length == 0)
   {
       $("#statusLine").html("Cannot find files...");
       return false;
   }

   console.log("Requesting file list");
   let fileBlob = await requestFileChunksFromList(chunks);
   if (!fileBlob)
   {
       $("#statusLine").html("Cannot find file contents...");
       return false;
   }
   let spinner_text_2 = getSpinnerText("Loading zip");
   console.log("Loading zip");
   $("#statusLine").html(spinner_text_2);
   const zip = await JSZip.loadAsync(fileBlob);
   let spinner_text_3 = getSpinnerText("Unpacking zip");
   console.log("Unpacking zip");
   $("#statusLine").html(spinner_text_3);
   await unPackFileJSONS(zip);
   $("#statusLine").html("");

   console.log("Sorting links");

   all_entries = { ...object_list_data };

   console.log("On system ready");
   onSystemReady();

   let entry_id = getQueryParam("entry_id");
   if (!entry_id) {
      sortAndFilter();
      fillListData();

      $('#pagination').html(getPaginationText());
   }
}


function onSystemReady() {
    /* shared between JSON and DB */

    system_initialized = true;
    $('#searchInput').prop('disabled', false);
    $('#searchInput').focus();

   let entry_id = getQueryParam("entry_id");
   if (entry_id) {
      performSearch();
   }
   else {
      $('#statusLine').html("System is ready! You can perform search now");
   }
}


function workerFunction(e) {
    const { success, message_type, result, error } = e.data;
    if (success) {
        if (message_type == "entries") {
             debug(`Received entries len:${result.length}`);

             let entry_id = getQueryParam("entry_id");

             if (!entry_id) {
                object_list_data = result;
                fillListData();

                object_list_data.entries.forEach(entry => {
                   if (isSocialMediaSupported(entry)) {
                      let query = selectEntrySocialStmt(entry.id);
                      worker.postMessage({ type:"socialdata", query:query });
                   }
                });
             }
             else {
                object_list_data = result;
                if (object_list_data.entries.length > 0) {
                     setEntryAsListData(object_list_data.entries[0]);
                }
             }
        }
        else if (message_type == "pagination") {
             let total_rows = result;

             entries_length = total_rows;

             let nav_text = getPaginationText();

             $('#pagination').html(nav_text);
             $('#statusLine').html("");
        }
        else if (message_type == "socialdata") {
            debug(`Received social data len:${result.length}`);

            if (result.length > 0) {
               result.forEach( social_data => {
                   FillSocialData(social_data.entry_id, social_data);
               });
            }
        }
        else if (message_type == "message") {
             if (result == "Creating database DONE") {
                onSystemReady();
             }
             else if (result == "Worker - DONE") {
                $('#statusLine').html("");
             }
             else {
                let new_spinner_text = getSpinnerText(result);
                $('#statusLine').html(new_spinner_text);
             }
        }
    } else {
        $('#statusLine').html('Worker error: '+ error);
        console.error('Worker error:', error);
    }
}


async function initWorker() {
    console.log("Init worker");
    let spinner_text = getSpinnerText("Initializing worker");
    $('#statusLine').html(spinner_text);

    worker = new Worker('scripts/dbworker.js?i=' + getSystemVersion());

    let file_name = getFileName();

    worker.postMessage({ type: "filename", fileName:  file_name});

    worker.onmessage = workerFunction;
    console.log("Init worker done");
    $('#statusLine').html("");
}


async function Initialize() {
    let file_name = getFileName();

    $('#searchInput').prop('disabled', true);

    if (isWorkerNeeded(file_name)) {
       return await InitializeForDb();
    }
    else {
       return await InitializeForJSON();
    }
}


function resetParams() {
   const currentUrl = new URL(window.location.href);
   currentUrl.searchParams.delete('page')
   currentUrl.searchParams.delete('search')
   currentUrl.searchParams.delete('entry_id')
   window.history.pushState({}, '', currentUrl);
}


function getVersionInformation() {
   return "File version:" + getFileVersion() + " System version:" + getSystemVersion();
}


function hideSearchSuggestions() {
   let search_suggestions = document.getElementById("search-suggestions");
   search_suggestions.style.display = "none";
   $("#dropdownButton").html("⌄");
}


function showSearchSuggestions() {
   let search_suggestions = document.getElementById("search-suggestions");
   search_suggestions.style.display = "block";
   $("#dropdownButton").html("^");
}


//-----------------------------------------------
$(document).on('click', '.btnNavigation', function(e) {
    e.preventDefault();

    const currentPage = $(this).data('page');

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('page', currentPage);
    window.history.pushState({}, '', currentUrl);

    animateToTop();

    performSearch();
});


//-----------------------------------------------
$(document).on('click', '.entry-list', function(e) {
    if (e.ctrlKey) {
        return;
    }

    e.preventDefault();

    let entryNumber = $(this).attr('entry');
    console.log("Entry list:" + entryNumber);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('entry_id', entryNumber);
    window.history.pushState({}, '', currentUrl);

    setEntryIdAsListData(entryNumber);

    animateToTop();
});


//-----------------------------------------------
$(document).on('click', '.go-back-button', function(e) {
    e.preventDefault();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('entry_id')
    window.history.pushState({}, '', currentUrl);

    sortAndFilter();
    fillListData();
    $('#pagination').html(getPaginationText());

    const userInput = $("#searchInput").val();
    if (userInput.trim() != "") {
        document.title = userInput;
    }
});


//-----------------------------------------------
$(document).on('click', '.copy-link', function(e) {
    e.preventDefault();
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(() => {
       $(this).html("Copied");
    }).catch((err) => {
       console.error("Error copying URL: ", err);
    });
});


//-----------------------------------------------
$(document).on('click', '.projectButton', function(e) {
    e.preventDefault();

    let fileName = $(this).text();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('file', fileName);
    window.history.pushState({}, '', currentUrl);

    object_list_data = null;
    $('#listData').html("");

    Initialize();
});


//-----------------------------------------------
$(document).on('click', '.suggestion-item', function(e) {
    e.preventDefault();

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('page')
    window.history.pushState({}, '', currentUrl);

    const searchInput = document.getElementById('searchInput');
    let suggestion_item_value = $(this).data('search')

    searchInput.value = suggestion_item_value;

    hideSearchSuggestions();

    performSearch();
});


//-----------------------------------------------
$(document).on('click', '#dropdownButton', function(e) {
    e.preventDefault();

    let search_suggestions = document.getElementById("search-suggestions");
    if (search_suggestions.style.display == "none") {
        showSearchSuggestions();
    }
    else {
        hideSearchSuggestions();
    }
});


//-----------------------------------------------
$(document).on('click', '#searchButton', function(e) {
    e.preventDefault();

    hideSearchSuggestions();
    resetParams();

    performSearch();
});


//-----------------------------------------------
$(document).on('click', '#helpButton', function(e) {
    $("#helpPlace").toggle();
});


$(document).on('click', '#homeButton', function(e) {
    let file_name = getQueryParam('file') || "permanent";

    const searchInput = document.getElementById('searchInput');
    searchInput.value = "";
    searchInput.focus();

    $('#listData').html("");
    $('#pagination').html("");

    hideSearchSuggestions();
    resetParams();
});


//-----------------------------------------------
$(document).on('keydown', "#searchInput", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();

        hideSearchSuggestions();
        resetParams();

        performSearch();
    }
});


//-----------------------------------------------
$(document).on('click', '#orderByVotes', function(e) {
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

    performSearch();
});


//-----------------------------------------------
$(document).on('click', '#orderByDatePublished', function(e) {
    if (sort_function == "-date_published")
    {
        sort_function = "date_published";
    }
    else
    {
        sort_function = "-date_published";
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

    performSearch();
});


//-----------------------------------------------
$(document).on('click', '#showIcons', function(e) {
    view_show_icons = true;

    fillListData();
});


//-----------------------------------------------
$(document).on('click', '#hideIcons', function(e) {
    view_show_icons = false;

    fillListData();
});


//-----------------------------------------------
$(document).on('click', '#directLinks', function(e) {
    show_pure_links = true;

    fillListData();
});


//-----------------------------------------------
$(document).on('click', '#localPreview', function(e) {
    show_pure_links = false;

    fillListData();
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


document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing")
    $("#projectNavbar").html(getNavBar());
    $("#projectList").html(getProjectListText());

    const searchContainer = document.getElementById('searchContainer');

    if (isMobile()) {
        searchContainer.style.width = '100%';
    }
    else {
        searchContainer.style.width = '60%';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');

    if (urlParams.has("view_show_icons")) {
        view_show_icons = urlParams.get("view_show_icons");
    }
    if (urlParams.has("view_display_type")) {
        view_display_type = urlParams.get("view_display_type");
    }
    if (urlParams.has("order")) {
        sort_function = urlParams.get('order');
    }

    if (urlParams.has("default_page_size")) {
        default_page_size = parseInt(urlParams.get('default_page_size'), 10);
    }

    if (searchParam) {
        $("#searchInput").val(searchParam);
    }

    if (!object_list_data) {
        try {
            Initialize();
        }
        catch {
            $("#statusLine").html("error");
        }
    }

    $("#version").html(getVersionInformation());
});
