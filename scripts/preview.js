let worker = null;
let db = null;
let object_list_data = null;

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


function fillDataInternal(entry) {
    document.title = entry.title;

    let text = getEntryDetailText(entry);

    $('#detailData').html(text);
}


function fillDataInternalMultiple(entries) {
    if (entries.length > 0)
        return fillDataInternal(entries[0]);
    else
    {
        $('#detailData').html("Could not find such entry");
        $('#statusLine').html("No entries found");
    }
}


function isEntryIdHit(entry, entry_id) {
    return entry.id == entry_id;
}


function fillData() {
    let data = object_list_data;

    $('#listData').html("");

    let entries = data.entries;

    if (!entries || entries.length == 0) {
        $('#statusLine').html("No entries found");
        $('#detailData').html("");
        return;
    }

    fillDataInternalMultiple(entries);
    $('#statusLine').html("")
}


function databaseReady() {
    fillData();
}


async function queryDatabaseLocal() {
    if (!worker) {
        console.log("No worker");
        return;
    }

    let spinner_text = getSpinnerText("Searching");
    $('#statusLine').html(spinner_text);

    let query = getQueryText();
    worker.postMessage({ query });
    console.log("Sent message: " + query);
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
                 $('#statusLine').html("");
            }
            else if (message_type == "pagination") {
                 $('#statusLine').html("");
            }
            else if (message_type == "message") {
                 if (result == "Creating database DONE") {
                     spinner_text = getSpinnerText("Querying database");
                     $('#statusLine').html(spinner_text);
                     queryDatabaseLocal();
                 }

                 let new_spinner_text = getSpinnerText(result);
                 $('#statusLine').html(new_spinner_text);
            }

        } else {
            console.error('Worker error:', error);
        }
    };

    console.log("Init worker done");
}


async function initAndQueryDatabase(dbFileName) {
  if (!object_list_data) {
    let spinner_text = getSpinnerText();

    const progressBarElement = document.getElementById('progressBarElement');
    progressBarElement.innerHTML = spinner_text;

    console.log(dbFileName);
    if (!worker) {
       initWorker();
    }

    progressBarElement.innerHTML = '';
  }
}


document.addEventListener('DOMContentLoaded', () => {
    if (!object_list_data) {
	let file_name = getFileName();
        initAndQueryDatabase(file_name);
    }
});
