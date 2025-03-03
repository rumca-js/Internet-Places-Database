// library code

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let preparingData = false;
let view_display_type = "search-engine";
let view_show_icons = false;
let view_small_icons = false;
let show_pure_links = true;
let highlight_bookmarks = false;
let object_list_data = null;
let sort_function = "-page_rating_votes"; // page_rating_votes, date_published
let default_page_size = 200;
let db;


function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}


function escapeHtml(unsafe)
{
    if (unsafe == null)
        return "";

    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


function getSpinnerText(text = 'Loading...') {
   return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${text}`;
}


function putSpinnerOnIt(button) {
    button.prop("disabled", true);

    button.html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );

    button.parents('form').submit();
}


function GetPaginationNav(currentPage, totalPages, totalRows) {
    totalPages = Math.ceil(totalPages);

    if (totalPages <= 1) {
        return '';
    }

    let paginationText = `
        <nav aria-label="Page navigation">
            <ul class="pagination">
    `;

    const currentUrl = new URL(window.location);
    currentUrl.searchParams.delete('page');
    const paginationArgs = `${currentUrl.searchParams.toString()}`;

    if (currentPage > 2) {
        paginationText += `
            <li class="page-item">
                <a href="?page=1&${paginationArgs}" data-page="1" class="btnNavigation page-link">|&lt;</a>
            </li>
        `;
    }
    if (currentPage > 2) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${currentPage - 1}&${paginationArgs}" data-page="${currentPage - 1}" class="btnNavigation page-link">&lt;</a>
            </li>
        `;
    }

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        paginationText += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a href="?page=${i}&${paginationArgs}" data-page="${i}" class="btnNavigation page-link">${i}</a>
            </li>
        `;
    }

    if (currentPage + 1 < totalPages) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${currentPage + 1}&${paginationArgs}" data-page="${currentPage + 1}" class="btnNavigation page-link">&gt;</a>
            </li>
        `;
    }
    if (currentPage + 1 < totalPages) {
        paginationText += `
            <li class="page-item">
                <a href="?page=${totalPages}&${paginationArgs}" data-page="${totalPages}" class="btnNavigation page-link">&gt;|</a>
            </li>
        `;
    }

    paginationText += `
            </ul>
            ${currentPage} / ${totalPages} @ ${totalRows}
        </nav>
    `;

    return paginationText;
}


/** functions **/


function getVotesBadge(page_rating_votes, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 30px;" + style;
    }

    let badge_text = page_rating_votes > 0 ? `
        <span class="badge text-bg-warning" style="${style}">
            ${page_rating_votes}
        </span>` : '';

    return badge_text;
}


function getBookmarkBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 5px;" + style;
    }

    let badge_star = entry.bookmarked ? `
        <span class="badge text-bg-warning" style="${style}">
            ★
        </span>` : '';
    return badge_star;
}


function getAgeBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 5px;" + style;
    }

    let badge_text = entry.age > 0 ? `
        <span class="badge text-bg-warning" style="${style}">
            A
        </span>` : '';
    return badge_text;
}


function getDeadBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 30px;" + style;
    }

    let badge_text = entry.date_dead_since ? `
        <span class="badge text-bg-warning" style="${style}">
            D
        </span>` : '';
    return badge_text;
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

    // const navbar = document.getElementById('navbar');
    // navbar.classList.remove('navbar-light', 'bg-dark');
    // navbar.classList.add('navbar-dark', 'bg-light');
}


function setDarkMode() {
    view_display_style = "style-dark";

    // const linkElement = document.querySelector('link[rel="stylesheet"][href*="styles.css_style-"]');
    // if (linkElement) {
    //     //linkElement.href = "/django/rsshistory/css/styles.css_style-dark.css";
    // }

    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", "dark");

    // const navbar = document.getElementById('navbar');
    // navbar.classList.remove('navbar-light', 'bg-light');
    // navbar.classList.add('navbar-dark', 'bg-dark');
}


function selectEntryTags(entry_id) {
   let text = `SELECT tag FROM usertags WHERE entry_id = ${entry_id}`;

   let result = new Set();

   console.log(text);

   const res = db.exec(text);

   if (res.length > 0) {
      const rows = res[0].values;

      rows.forEach(row => {
         result.add(row[0]);
      });
   }

   return Array.from(result); 
}
