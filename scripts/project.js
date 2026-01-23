
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


function isWorkerNeeded(fileName) {
    if (fileName.indexOf("db") != -1 || fileName.indexOf("db.zip") != -1) {
        return true;
    }
    return false;
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


function readConfig() {
    const urlParams = new URLSearchParams(window.location.search);

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
}
