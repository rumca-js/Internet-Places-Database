let worker = null;
let db = null;
let object_list_data = null;
let system_initialized = false;

let view_display_type = "search-engine";
let view_display_style = "style-light";
let view_show_icons = false;
let view_small_icons = false;
let user_age = 1;
let debug_mode = false;

let entries_direct_links = true;
let highlight_bookmarks = false;
let sort_function = "-page_rating_votes"; // page_rating_votes, date_published
let default_page_size = 200;

let entries_visit_alpha=1.0;
let entries_dead_alpha=0.5;


function getDefaultFileName() {
    return "internet.db";
}


function getFileList() {
    return ["internet.db",
    ];
}


function getDefaultFileLocation() {
    return "/";
}


function getFileVersion() {
    /* Forces refresh of the file */
    return "82";
}


function getSystemVersion() {
    return "1.2";
}


function getInitialSearchSuggestsions() {
    return ["link LIKE '%youtube.com/channel%'",
        "link LIKE '%github.com/%'",
        "link LIKE '%reddit.com/%'",
        "link LIKE 'https://x.com/%'",
        "t.tag LIKE '%search engine%'",
        "t.tag LIKE '%operating system%'",
        "t.tag LIKE '%interesting%'",
        "t.tag LIKE '%self host%'",
        "t.tag LIKE '%programming language%'",
        "t.tag LIKE '%music artist%'",
        "t.tag LIKE '%music band%'",
        "t.tag LIKE '%video games%'",
        "t.tag LIKE '%video game%'",
        "t.tag LIKE '%wtf%'",
        "t.tag LIKE '%funny%'",
    ];
}


function notify(text) {
    console.log(text);
}


function debug(text) {
    if (debug_mode) {
    console.log(text);
    }
}
