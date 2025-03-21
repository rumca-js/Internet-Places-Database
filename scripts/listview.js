let worker = null;
let db = null;
let object_list_data = null;   // all objects lists
let system_initialized = false;
let user_age = 1;

let view_display_type = "search-engine";
let view_show_icons = false;
let view_small_icons = false;
let show_pure_links = true;
let highlight_bookmarks = false;
let sort_function = "-page_rating_votes"; // page_rating_votes, date_published
let default_page_size = 200;


function getFileName() {
    let file_name = getQueryParam('file') || getDefaultFileName();

    let adir = getDefaultFileLocation();

    if (file_name.indexOf(".zip") === -1 && file_name.indexOf(".db") === -1)
        file_name = file_name + ".db";

    if (file_name.indexOf(adir) === -1)
        file_name = adir + file_name

    return file_name;
}


function fillListDataInternal(entries) {
    var finished_text = getEntriesList(entries);

    $('#listData').html(finished_text);
}


function fillListData() {
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
}


function databaseReady() {
   fillListData();
}


async function initWorker() {
    console.log("Init worker");
    let spinner_text = getSpinnerText("Initializing worker");
    $('#statusLine').html(spinner_text);

    worker = new Worker('scripts/dbworker.js?i=' + getQueryParam("i"));

    let file_name = getFileName();

    worker.postMessage({ fileName:  file_name});

    worker.onmessage = function (e) {
        const { success, message_type, result, error } = e.data;
        if (success) {
            if (message_type == "entries") {
                 object_list_data = result;
                 databaseReady();
            }
            else if (message_type == "pagination") {
                 let total_rows = result;
                 let page_num = parseInt(getQueryParam("page")) || 1;
                 let nav_text = GetPaginationNav(page_num, total_rows/PAGE_SIZE, total_rows)
                 console.log("total rows: " + total_rows);
                 console.log("page num: " + page_num);
                 console.log("page size: " + PAGE_SIZE);

                 $('#pagination').html(nav_text);
                 $('#statusLine').html("");
            }
            else if (message_type == "message") {
                 if (result == "Creating database DONE") {
                    system_initialized = true;
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
    };
    console.log("Init worker done");
    $('#statusLine').html("");
}


async function Initialize() {
  if (!object_list_data) {
    if (!worker) {
       initWorker();
    }
  }
}


async function queryDatabaseLocal() {
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
    worker.postMessage({ query });
    console.log("Sent message: " + query);
}


async function searchInputFunction() {
    if (!system_initialized) {
        $("#statusLine").html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Reading data...`);
        return;
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('page', 1);
    window.history.pushState({}, '', currentUrl);

    let userInput = $("#searchInput").val();
    document.title = userInput;

    await queryDatabaseLocal();
}


//-----------------------------------------------
$(document).on('click', '.btnNavigation', async function(e) {
    e.preventDefault();

    const currentPage = $(this).data('page');
    const currentUrl = new URL(window.location.href);

    currentUrl.searchParams.set('page', currentPage);

    window.history.pushState({}, '', currentUrl);

    $('html, body').animate({ scrollTop: 0 }, 'slow');

    await queryDatabaseLocal();
});

//-----------------------------------------------
$(document).on('click', '.entry-list', function(e) {
    // Check if the Ctrl or Cmd key is pressed (Windows/Linux: Ctrl, Mac: Cmd)
    if (e.ctrlKey || e.metaKey) {
        // If Ctrl or Cmd is pressed, allow the default behavior
        return;  // Do not prevent default
    }

    e.preventDefault();

    let entryNumber = $(this).attr('entry');
    console.log("Entry list:" + entryNumber);

    let entry = getEntry(entryNumber);
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
});


//-----------------------------------------------
$(document).on('click', '.go-back-button', function(e) {
    e.preventDefault();
    fillListData();
});


//-----------------------------------------------
$(document).on('click', '.copy-link', function(e) {
    // TODO
});


//-----------------------------------------------
$(document).on('click', '.entry-detail', function(e) {
    e.preventDefault();

    let entryNumber = $(this).attr('entry');
    console.log("Entry detail:" + entryNumber);

    let entry = getEntry(entryNumber);
    if (entry) {
       let entry_detail_text = getEntryListText(entry);
       $(this).html(entry_detail_text);
    }
    else {
       $("#statusLine").html("Invalid entry");
    }
});


//-----------------------------------------------
$(document).on('click', '#searchButton', async function(e) {
    console.log("searchButton");
    await searchInputFunction();
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
$(document).on('keydown', "#searchInput", async function(e) {
    if (e.key === "Enter") {
        e.preventDefault();

        await searchInputFunction();
    }
});


//-----------------------------------------------
$(document).on('click', '#orderByVotes', async function(e) {
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

    await queryDatabaseLocal();
});


//-----------------------------------------------
$(document).on('click', '#orderByDatePublished', async function(e) {
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

    await queryDatabaseLocal();
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
        try {
            Initialize();
        }
        catch {
            $("#statusLine").html("error");
        }
    }
});


window.addEventListener("beforeunload", (event) => {
    if (!system_initialized) {
        event.preventDefault();
        event.returnValue = '';
    }
});
