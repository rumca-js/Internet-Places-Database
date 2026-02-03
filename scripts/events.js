function onSearchStart() {
    $('#searchInput').prop('disabled', true);
    $('#searchButton').prop('disabled', true);

    let spinner_text = getSpinnerText("Searching");
    $('#statusLine').html(spinner_text);
}


function onSearchStop() {
    $('#searchInput').prop('disabled', false);
    $('#searchButton').prop('disabled', false);
    $('#statusLine').html("");
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
             onSearchStop();
        }
        else if (message_type == "socialdata") {
            debug(`Received social data len:${result.length}`);
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


function clearInput(focus=true) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = "";
      if (focus) {
         searchInput.focus();
      }
    }
}


function registerEventsListeners() {
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
          $(this).removeClass("btn-primary").addClass("btn-success");
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
   
       resetParams();
   
       let suggestion_item_value = $(this).data('search')
   
       $("#searchInput").val(suggestion_item_value);
   
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
       resetParams();
   
       const searchInput = document.getElementById('searchInput');
       searchInput.value = "";
       searchInput.focus();
   
       $('#listData').html("");
       $('#pagination').html("");
   
       hideSearchSuggestions();
   });
   
   
   //-----------------------------------------------
   $(document).on('click', '#showIcons', function(e) {
       view_show_icons = $(this).is(':checked');
   
       fillListData();
   });
   
   
   //-----------------------------------------------
   $(document).on('click', '#directLinks', function(e) {
       entries_direct_links = $(this).is(':checked');
   
       fillListData();
   });


   //-----------------------------------------------
   $(document).on('click', '#modal-preview', function(e) {
       click_behavior_modal_window = $(this).is(':checked');
   
       fillListData();
   });


   //-----------------------------------------------
   $(document).on('click', '#highlight-bookmarks', function(e) {
       highlight_bookmarks = $(this).is(':checked');
   
       fillListData();
   });
   
   
   //-----------------------------------------------
   $(document).on('change', 'input[name="viewMode"]', function () {
       view_display_type = $(this).val();
       fillListData();
   });
   
   
   $(document).on('change', 'input[name="theme"]', function () {
       view_display_style = $(this).val();
   
       if (view_display_style == "style-light") {
           setLightMode();
       }
       else {
           setDarkMode();
       }
   
       fillListData();
   });
   
   
   //-----------------------------------------------
   $(document).on('change', 'input[name="order"]', function () {
       sort_function = $(this).val();
   
       const currentUrl = new URL(window.location.href);
       currentUrl.searchParams.set('order', sort_function);
       window.history.pushState({}, '', currentUrl);
   
       performSearch();
   });
   
   
   //-----------------------------------------------
   $(document).on('keydown', "#searchInput", function(e) {
     if (e.key === "Enter") {
         e.preventDefault();
   
         hideSearchSuggestions();
         resetParams();
   
         performSearch();
     }
     if (e.key === "Escape") {
       e.preventDefault(); // Prevent browser's default quick find (especially in Firefox)
       clearInput();
     }
     if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
       e.preventDefault(); // Prevent browser's default quick find (especially in Firefox)
       const searchInput = document.getElementById('searchInput');
       if (searchInput) {
         if (focus) {
            searchInput.focus();
         }
       }
     }
     // Check if "/" is pressed and the target isn't an input/textarea already
     if (e.key === '/' && !e.target.closest('input, textarea')) {
       e.preventDefault(); // Prevent browser's default quick find (especially in Firefox)
       
       clearInput();
     }
   });

   function onShowContainer(container) {
       if (!container || container.dataset.loaded) return;
   
       const src = container.dataset.youtubeSrc;
   
       container.innerHTML = `
           <iframe
               src="${src}"
               title="YouTube video"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowfullscreen>
           </iframe>
       `;
   
       container.dataset.loaded = 'true';
   }

   function onHideContainer(container) {
       if (!container) return;
   
       container.innerHTML = `
           <div class="d-flex justify-content-center align-items-center bg-dark text-white">
               ▶ Click to load video
           </div>
       `;
   
       delete container.dataset.loaded;
   }

   document.addEventListener('shown.bs.modal', function (e) {
       const container = e.target.querySelector('.youtube-lazy');
       onShowContainer(container);
   });
   
   document.addEventListener('hidden.bs.modal', function (e) {
       const container = e.target.querySelector('.youtube-lazy');
       onHideContainer(container);
   });

   document.addEventListener('shown.bs.collapse', function (e) {
       const container = e.target.querySelector('.youtube-lazy');
       onShowContainer(container);
   });
   
   document.addEventListener('hidden.bs.collapse', function (e) {
       const container = e.target.querySelector('.youtube-lazy');
       onHideContainer(container);
   });
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing")

    $("#projectNavbar").html(getNavBar());
    $("#projectList").html(getProjectListText());

    const searchContainer = document.getElementById('searchContainer');

    readConfig();
    updateWidgets();
    registerEventsListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');

    if (searchParam) {
        $("#searchInput").val(searchParam);
    }

    if (!object_list_data) {
        try {
            Initialize();
        }
        catch {
            $("#statusLine").html("Cannot initialize search system");
        }
    }

    $("#system-information").html(getSystemInformationHtml());
});
