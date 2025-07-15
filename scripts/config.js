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
    return "69";
}


function getSystemVersion() {
    return "0.9";
}


function getInitialSearchSuggestsions() {
    return ["link LIKE '%youtube.com/channel%'",
        "link LIKE '%github.com/%'",
        "link LIKE '%reddit.com/%'",
        "e.tag LIKE '%search engine%'",
        "e.tag LIKE '%operating system%'",
        "e.tag LIKE '%interesting%'",
        "e.tag LIKE '%self host%'",
        "e.tag LIKE '%programming language%'",
        "e.tag LIKE '%music artist%'",
        "e.tag LIKE '%music band%'",
        "e.tag LIKE '%video games%'",
        "e.tag LIKE '%video game%'",
        "e.tag LIKE '%wtf%'",
        "e.tag LIKE '%funny%'",
    ];
}
