let worker = null;
let db = null;
let object_list_data = null;


function getFileName() {
    let file_name = getQueryParam('file') || "internet.db";

    let adir = "/";

    if (file_name.indexOf(".zip") === -1 && file_name.indexOf(".db") === -1)
        file_name = file_name + ".db";

    if (file_name.indexOf(adir) === -1)
	file_name = adir + file_name

    return file_name;
}


function getEntryText(entry) {
    let text = `
    <a href="${entry.link}"><h1>${entry.title}</h1></a>
    <div><a href="${entry.link}">${entry.link}</a></div>
    <div><b>Publish date:</b>${entry.date_published}</div>
    `;

    //let tags = selectEntryTags(entry.id);
    //let tagString = Array.from(tags).map(tag => `#${tag}`).join(", ");
    let tagString = "";
    
    text += `
        <div>Tags: ${tagString}</div>
    `;

    text += `
    <div>${entry.description.replace(/\n/g, '<br>')}</div>
    `;

    text += `
    <h3>Parameters</h3>
    <div>Language: ${entry.language}</div>
    <div>Points: ${entry.page_rating}|${entry.page_rating_votes}|${entry.page_rating_contents}</div>
    `;

    if (entry.date_dead_since)
        text += `<div>Dead since:${entry.date_dead_since}</div>`;

    text += `
    <div>Author: ${entry.author}</div>
    <div>Album: ${entry.album}</div>
    <div>Status code: ${entry.status_code}</div>
    <div>Manual status code: ${entry.manual_status_code}</div>
    <div>Permanent: ${entry.permanent}</div>
    <div>Age: ${entry.age}</div>
    `;

    return text;
}


function fillDataInternalStandard(entry) {
    let text = `
    <div><img src="${entry.thumbnail}" style="max-width:100%;"/></div>
    `;

    text += getEntryText(entry);

    $('#detailData').html(text);
}


function fillDataInternalYouTube(entry) {
    // Extract the video ID from the YouTube link
    const urlParams = new URL(entry.link).searchParams;
    const videoId = urlParams.get("v");

    // Construct the embed URL
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

    // Build the HTML content
    let text = "";

    // Add the embedded YouTube player if a valid video ID exists
    if (videoId) {
        text += `
        <div>
        <div class="youtube_player_container">
            <iframe src="${embedUrl}" frameborder="0" allowfullscreen class="youtube_player_frame" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        </div>
        `;
    }

    text += getEntryText(entry);

    $('#detailData').html(text);
}


function fillDataInternalOdysee(entry) {
    // Extract the video ID from the YouTube link
    const url = new URL(entry.link);
    const videoId = url.pathname.split('/').pop();

    // Construct the embed URL
    const embedUrl = videoId ? `https://odysee.com/$/embed/${videoId}` : "";

    // Build the HTML content
    let text = "";

    // Add the embedded YouTube player if a valid video ID exists
    if (videoId) {
        text += `
        <div>
        <div class="youtube_player_container">
            <iframe style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;" width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe>
        </div>
        </div>
        `;
    }

    text += getEntryText(entry);

    $('#detailData').html(text);
}


function fillDataInternal(entry) {
    document.title = entry.title;

    if (entry.link.startsWith("https://www.youtube.com/watch?v="))
        return fillDataInternalYouTube(entry);
    else if (entry.link.startsWith("https://odysee.com/"))
        return fillDataInternalOdysee(entry);
    else
        return fillDataInternalStandard(entry);
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

    worker = new Worker('scripts/worker.js?i=' + getFileVersion());

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
