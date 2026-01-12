
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


function getNavBar() {
    if (isMobile()) {
       return getNavBarMobile();
    }
    else {
       return getNavBarDesktop();
    }
}


function getNavBarMobile() {
    let home_text = getNavHomeButton();
    let navbar_search_form = getNavSearchForm();
    let navbar_files_menu = getNavFiles();
    let navbar_view_menu = getNavBarViewMenu();
    let suggestions = getSearchSuggestionContainer();

    let nav_text = `
    <nav id="navbar" class="navbar sticky-top navbar-expand-lg navbar-light bg-light container-fluid">
      <div class="container-fluid">
      <!--div class="d-flex justify-content-end align-items-center w-100"-->
        ${home_text}

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>

      <div class="container-fluid">
        ${navbar_search_form}
      </div>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
               ${navbar_files_menu}

               ${navbar_view_menu}

               <li class="nav-item">
                 <a id="helpButton" class="nav-link" href="#">?</a>
               </li>
            </ul>
        </div>

      </div>
    </nav>

    ${suggestions}
    `;

    return nav_text;
}


function getNavBarDesktop() {
    let home_text = getNavHomeButton();
    let navbar_search_form = getNavSearchForm();
    let navbar_files_menu = getNavFiles();
    let navbar_view_menu = getNavBarViewMenu();
    let suggestions = getSearchSuggestionContainer();

    let nav_text = `
    <nav id="navbar" class="navbar sticky-top navbar-expand-lg navbar-light bg-light container-fluid">
      <div class="container-fluid">
        ${home_text}

        ${navbar_search_form}

        <!-- Navbar toggler button, aligned to the right -->
        <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
      </div>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
             ${navbar_files_menu}

             ${navbar_view_menu}

             <li class="nav-item">
               <a id="helpButton" class="nav-link" href="#">?</a>
             </li>
          </ul>
      </div>
    </nav>

    ${suggestions}
    `;


    return nav_text;
}


function getNavSearchForm() {
    return `
        <form class="d-flex w-100 ms-3" id="searchContainer">
          <div class="input-group">
            <input id="searchInput" class="form-control me-1 flex-grow-1" type="search" placeholder="Search" autofocus aria-label="Search">
            <button id="dropdownButton" class="btn btn-outline-secondary" type="button">⌄</button>
            <button id="searchButton" class="btn btn-outline-success" type="submit">🔍</button>
          </div>
        </form>
        `;
}


function getNavHomeButton() {
    return `<a id="homeButton" class="d-flex align-items-right px-3 mb-2" href="#">🏠</a>`;
}


function getNavFiles() {
    let project_text = getProjectListTextNav();
    return `
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Files
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                ${project_text}
            </ul>
          </li>`;
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
        `<li class="list-group-item suggestion-item" style="cursor:pointer" data-search="${suggestion}">🔍${suggestion}</li>`
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


function getNavBarViewMenu() {
    return `
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarViewDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              View
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarViewDropdown">
                <!-- View Type Radio Group -->
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="viewMode" id="viewStandard" value="standard">
                        <label class="form-check-label" for="viewStandard">Standard</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="viewMode" id="viewGallery" value="gallery">
                        <label class="form-check-label" for="viewGallery">Gallery</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="viewMode" id="viewSearchEngine" value="search-engine">
                        <label class="form-check-label" for="viewSearchEngine">Search engine</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="viewMode" id="viewContentCentric" value="content-centric">
                        <label class="form-check-label" for="viewContentCentric">Content centric</label>
                    </div>
                </li>

                <li><hr class="dropdown-divider"></li>

                <!-- Theme Radio Group -->
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="theme" id="displayLight" value="style-light">
                        <label class="form-check-label" for="displayLight">Light</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="theme" id="displayDark" value="style-dark">
                        <label class="form-check-label" for="displayDark">Dark</label>
                    </div>
                </li>

                <li><hr class="dropdown-divider"></li>

                <!-- Order Radio Group -->
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByVotesASC" value="page_rating_votes">
                        <label class="form-check-label" for="orderByVotesASC">Order by Votes ASC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByVotesDESC" value="-page_rating_votes">
                        <label class="form-check-label" for="orderByVotesDESC">Order by Votes DESC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByDatePublishedASC" value="date_published">
                        <label class="form-check-label" for="orderByDatePublishedASC">Order by Date published ASC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByDatePublishedDESC" value="-date_published">
                        <label class="form-check-label" for="orderByDatePublishedDESC">Order by Date published DESC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="viewsASC" value="view_count">
                        <label class="form-check-label" for="viewsASC">Order by views ASC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="viewsDESC" value="-view_count">
                        <label class="form-check-label" for="viewsDESC">Order by views DESC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByMostFollowedASC" value="followers_count">
                        <label class="form-check-label" for="orderByMostFollowedASC">Order by most followed ASC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByMostFollowedDESC" value="-followers_count">
                        <label class="form-check-label" for="orderByMostFollowedDESC">Order by most followed DESC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByStarsASC" value="stars">
                        <label class="form-check-label" for="orderByStarsASC">Order by most stars ASC</label>
                    </div>
                </li>
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="radio" name="order" id="orderByStarsDESC" value="-stars">
                        <label class="form-check-label" for="orderByStarsDESC">Order by most stars DESC</label>
                    </div>
                </li>

                <li><hr class="dropdown-divider"></li>

                <!-- Checkboxes -->
                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="checkbox" id="showIcons">
                        <label class="form-check-label" for="showIcons">Show icons</label>
                    </div>
                </li>

                <li><hr class="dropdown-divider"></li>

                <li>
                    <div class="dropdown-item form-check">
                        <input class="form-check-input me-2" type="checkbox" id="directLinks">
                        <label class="form-check-label" for="directLinks" title="Links lead directly to URL">Direct links</label>
                    </div>
                </li>
            </ul>
          </li>
          `;
}


function setLightMode() {
    view_display_style = "style-light";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     // TODO replace rsshistory with something else
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-light.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "light");

    const navbar = document.getElementById('navbar');
    navbar.classList.remove('navbar-dark', 'bg-dark');
    navbar.classList.add('navbar-light', 'bg-light');
}


function setDarkMode() {
    view_display_style = "style-dark";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-dark.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "dark");

    const navbar = document.getElementById('navbar');
    navbar.classList.remove('navbar-light', 'bg-light');
    navbar.classList.add('navbar-dark', 'bg-dark');
}


function updateWidgets() {
    $('#showIcons').prop('checked', view_show_icons);
    $('#directLinks').prop('checked', entries_direct_links);

    $('input[name="viewMode"][value="' + view_display_type + '"]').prop('checked', true);
    $('input[name="theme"][value="' + view_display_style + '"]').prop('checked', true);
    $('input[name="order"][value="' + sort_function + '"]').prop('checked', true);
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
