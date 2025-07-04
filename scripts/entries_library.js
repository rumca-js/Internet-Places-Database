/*
 * requires
 *  - show_pure_link
 *  - highlight_bookmarks
 */


function isStatusCodeValid(entry) {
    if (entry.status_code >= 200 && entry.status_code < 400)
        return true;

    // unknown status is valid (undetermined, not invalid)
    if (entry.status_code == 0)
        return true;

    // user agent, means that something is valid, but behind paywall
    if (entry.status_code == 403)
        return true;

    return false;
}


function isEntryValid(entry) {
    return entry.is_valid === false || 
        (isStatusCodeValid(entry)) ||
        entry.manual_status_code == 200;
}


function getEntryLink(entry) {
    return show_pure_links ? entry.link : `?entry_id=${entry.id}`;
}


function canUserView(entry) {
    if (entry.age == 0 || entry.age == null)
        return true;

    if (entry.age < user_age)
        return true;

    return false;
}


function getEntryAuthorText(entry) {
    if (entry.author && entry.album)
    {
        return entry.author + " / " + entry.album;
    }
    else if (entry.author) {
        return entry.author;
    }
    else if (entry.album) {
        return entry.album;
    }
    return "";
}


function getEntryVotesBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 30px;" + style;
    }

    let badge_text = entry.page_rating_votes > 0 ? `
        <span class="badge text-bg-warning" style="${style}" title="User vote">
            ${entry.page_rating_votes}
        </span>` : '';

    return badge_text;
}


function getEntryBookmarkBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 5px; right: 5px;" + style;
    }

    let badge_star = entry.bookmarked ? `
        <span class="badge text-bg-warning" style="${style}" title="Bookmarked">
            ★
        </span>` : '';
    return badge_star;
}


function getEntryAgeBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 5px;" + style;
    }

    let badge_text = entry.age > 0 ? `
        <span class="badge text-bg-warning" style="${style}" title="Age limit">
            A
        </span>` : '';
    return badge_text;
}


function getEntryDeadBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 30px;" + style;
    }

    let badge_text = entry.date_dead_since ? `
        <span class="badge text-bg-warning" style="${style}" title="Dead">
           💀
        </span>` : '';
    return badge_text;
}


function getEntryTags(entry) {
    let tags_text = "";
    if (entry.tags && entry.tags.length > 0) {
        tags_text = entry.tags.map(tag => `#${tag}`).join(",");
    }
    return tags_text;
}


function getEntryThumbnail(entry) {
    if (!canUserView(entry))
    {
        return;
    }

    let thumbnail = entry.thumbnail;

    return thumbnail;
}


function getEntryLinkText(entry) {
    let link = entry.link;
    return `<div class="text-reset text-decoration-underline">@ ${link}</div>`;
}


function getEntrySourceTitle(entry) {
    let source__title = "";
    if (entry.source__title) {
       source__title = escapeHtml(entry.source__title)
    }
    return source__title;
}


function getEntrySourceUrl(entry) {
    let source_url = "";
    if (entry.source_url) {
       source_url = entry.source_url;
    }
    return source_url;
}


function getEntrySourceInfo(entry) {
    let source_title = getEntrySourceTitle(entry);
    let source_url = getEntrySourceUrl(entry);

    let html = "";

    if (source_title) {
        html += `<div><a href="${source_url}">${source_title}</a></div>`;
    }
    else if (source_url) {
        html += `<div><a href="${source_url}">Source URL</a></div>`;
    }

    let channel_url = getChannelUrl(entry.source_url);
    if (channel_url)
        html += `<div><a href="${channel_url}">Channel</a></div>`;

    return html;
}


function getEntryDatePublished(entry) {
    let datePublishedStr = "";
    if (entry.date_published) {
        let datePublished = new Date(entry.date_published);
        if (!isNaN(datePublished)) {
            datePublishedStr = parseDate(datePublished);
        }
    }

    return datePublishedStr;
}


function getEntryTitleSafe(entry) {
    let title_safe = "";

    if (!canUserView(entry))
    {
        return "----Age limited----";
    }

    if (entry.title_safe) {
       title_safe = escapeHtml(entry.title_safe)
    }
    else
    {
       title_safe = escapeHtml(entry.title)
    }

    if (title_safe.length > 200) {
        title_safe = title_safe.substring(0, 200);
        title_safe = title_safe + "...";
    }

    return title_safe;
}


function getEntryParameters(entry) {
   html_out = "";

   let date_published = getEntryDatePublished(entry);

   html_out += `<div class="text-nowrap"><strong>Publish date:</strong> ${date_published}</div>`;

   html_out += getEntryBookmarkBadge(entry);
   html_out += getEntryVotesBadge(entry);
   html_out += getEntryAgeBadge(entry);
   html_out += getEntryDeadBadge(entry);

   return html_out;
}


function getEntryDescription(entry) {
  if (!entry.description)
    return "";

  const content = new InputContent(entry.description);
  let content_text = content.htmlify();

  content_text = content_text.replace(/(\r\n|\r|\n)/g, "<br>");
  return content_text;
}


/**
 * Detail view
 */


function getArchiveOrgLink(link) {
    let currentDate = new Date();
    let formattedDate = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // Format: YYYYMMDD

    return `https://web.archive.org/web/${formattedDate}000000*/${link}`;
}


function getW3CValidatorLink(link) {
    return `https://validator.w3.org/nu/?doc=${encodeURIComponent(link)}`;
}


function getSchemaValidatorLink(link) {
    return `https://validator.schema.org/#url=${encodeURIComponent(link)}`;
}


function getWhoIsLink(link) {
    let domain = link.replace(/^https?:\/\//, ''); // Remove 'http://' or 'https://'

    return `https://who.is/whois/${domain}`;
}


function getBuiltWithLink(link) {
    let domain = link.replace(/^https?:\/\//, ''); // Remove 'http://' or 'https://'

    return `https://builtwith.com/${domain}`;
}


function getGoogleTranslateLink(link) {

    let reminder = '?_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp';
    if (link.indexOf("http://") != -1) {
       reminder = '?_x_tr_sch=http&_x_tr_sl=auto&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp';
    }

    if (link.indexOf("?") != -1) {
        let queryParams = link.split("?")[1];
        reminder += '&' + queryParams;
    }

    let domain = link.replace(/^https?:\/\//, '').split('/')[0]; // Extract the domain part

    domain = domain.replace(/-/g, '--').replace(/\./g, '-');

    let translateUrl = `https://${domain}.translate.goog/` + reminder;

    return translateUrl;
}


function GetEditMenu(entry) {
    let link = entry.link;

    let translate_link = getGoogleTranslateLink(link);
    let archive_link = getArchiveOrgLink(link);
    let w3c_link = getW3CValidatorLink(link);
    let schema_link = getSchemaValidatorLink(link);
    let who_is_link = getWhoIsLink(link);
    let builtwith_link = getBuiltWithLink(link);

    let text = 
    `<div class="dropdown mx-1">
        <button class="btn btn-primary" type="button" id="#entryViewDrop" data-bs-toggle="dropdown" aria-expanded="false">
          View
        </button>
        <ul class="dropdown-menu">`;

    text += `
        <li>
          <a href="${translate_link}" id="Edit" class="dropdown-item" title="Edit entry">
             View translate
          </a>
        </li>
    `;

    text += `
        <li>
          <a href="${archive_link}" id="Archive-org" class="dropdown-item" title="View archived version on archive.org">
             View archive.org
          </a>
        </li>
    `;

    text += `
        <li>
          <a href="${w3c_link}" id="w3c-validator" class="dropdown-item" title="Edit entry">
             W3C validator
          </a>
        </li>
    `;

    text += `
        <li>
          <a href="${schema_link}" id="Schama-Validator" class="dropdown-item" title="Edit entry">
             Schema validator
          </a>
        </li>
    `;

    text += `
        <li>
          <a href="${who_is_link}" id="Who-Is" class="dropdown-item" title="Edit entry">
             Who Is validator
          </a>
        </li>
    `;
    text += `
        <li>
          <a href="${builtwith_link}" id="Bulit with" class="dropdown-item" title="Edit entry">
             Built with
          </a>
        </li>
    `;

    text += `</div>`;

    return text;
}


function getEntryOpParameters(entry) {
    text = "";

    text += `
    <h3>Parameters</h3>
    <div title="Points:Page rating|User rating|Page contents rating">Points: ${entry.page_rating}|${entry.page_rating_votes}|${entry.page_rating_contents}</div>
    `;

    if (entry.date_created) {
        date_created = parseDate(entry.date_created);
        text += `<div>Creation date:${date_created}</div>`;
    }

    if (entry.date_updated) {
        date_updated = parseDate(entry.date_updated);
        text += `<div>Update date:${date_updated}</div>`;
    }

    if (entry.date_dead_since) {
        date_dead_since = parseDate(entry.date_dead_since);
        text += `<div>Dead since:${date_dead_since}</div>`;
    }

    text += `
    <div>Author: ${entry.author}</div>
    <div>Album: ${entry.album}</div>
    <div>Status code: ${entry.status_code}</div>
    <div>Permanent: ${entry.permanent}</div>
    <div>Language: ${entry.language}</div>
    `;

    if (entry.manual_status_code) {
       text += `
       <div>Manual status code: ${entry.manual_status_code}</div>
       `;
    }

    if (entry.age) {
       text += `
       <div>Age: ${entry.age}</div>
       `;
    }

    return text;
}


function getEntryBodyText(entry) {
    let date_published = parseDate(entry.date_published);
    let parameters = getEntryParameters(entry);

    let text = `
    <a href="${entry.link}"><h1>${entry.title}</h1></a>
    <div><a href="${entry.link}">${entry.link}</a></div>
    ${parameters}
    `;

    let tags_text = getEntryTags(entry);
    
    if (tags_text) {
       text += `
           <div>Tags: ${tags_text}</div>
       `;
    }

    text += GetEditMenu(entry);

    let source_info = getEntrySourceInfo(entry);
    text += `
    <div>${source_info}</div>
    `;

    let description = getEntryDescription(entry);

    text += `
    <div>${description}</div>
    `;

    text += getEntryOpParameters(entry);

    return text;
}


function getEntryFullTextStandard(entry) {
    let text = `<div entry="${entry.id}" class="entry-detail">`;

    if (entry.thumbnail) {
       text += `
       <div><img src="" style="max-width:30%;"/></div>
       `;

       if (canUserView(entry))
       {
          text = `
          <div><img src="${entry.thumbnail}" style="max-width:30%;"/></div>
          `;
       }
    }

    text += getEntryBodyText(entry);

    text += "</div>";

    return text;
}


function getEntryFullTextYouTube(entry) {
    const urlParams = new URL(entry.link).searchParams;
    const videoId = urlParams.get("v");

    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : "";

    let text = `<div entry="${entry.id}" class="entry-detail">`;

    if (videoId) {
        text += `
          <div class="youtube_player_container">
              <iframe src="${embedUrl}" frameborder="0" allowfullscreen class="youtube_player_frame" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        `;
    }

    text += getEntryBodyText(entry);

    text += "</div>";

    return text;
}


function getEntryFullTextOdysee(entry) {
    const url = new URL(entry.link);
    const videoId = url.pathname.split('/').pop();

    const embedUrl = videoId ? `https://odysee.com/$/embed/${videoId}` : "";

    let text = `<div entry="${entry.id}" class="entry-detail">`;

    if (videoId) {
        text += `
           <div class="youtube_player_container">
               <iframe style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;" width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe>
           </div>
        `;
    }

    text += getEntryBodyText(entry);
    text += "</div>";

    return text;
}


function getEntryDetailText(entry) {
    let text = "";

    if (entry.link.startsWith("https://www.youtube.com/watch?v="))
        text = getEntryFullTextYouTube(entry);
    else if (entry.link.startsWith("https://odysee.com/"))
        text = getEntryFullTextOdysee(entry);
    else
        text = getEntryFullTextStandard(entry);

    return text;
}


/**
 * Entry list items
 */


function entryStandardTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getEntryVotesBadge(entry);
    let badge_star = getEntryBookmarkBadge(entry);
    let badge_age = getEntryAgeBadge(entry);
    let badge_dead = getEntryDeadBadge(entry);

    let invalid_style = isEntryValid(entry) ? `` : `style="opacity: 0.5"`;
    let bookmark_class = entry.bookmarked ? `list-group-item-primary` : '';
    let thumbnail = getEntryThumbnail(entry);

    let img_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        img_text = `<img src="${thumbnail}" class="rounded ${iconClass}" />`;
    }
    
    let thumbnail_text = '';
    if (img_text) {
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                ${img_text}
            </div>`;
    }
    let tags_text = getEntryTags(entry);
    let tags = `<div class="text-reset mx-2">${tags_text}</div>`;
    let source__title = getEntrySourceTitle(entry);
    let date_published = getEntryDatePublished(entry);
    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;
    let entry_link = getEntryLink(entry);

    let author = entry.author;
    if (author && author != source__title)
    {
       "by " + escapeHtml(entry.author);
    }
    else
    {
       author = "";
    }

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            ${invalid_style}
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
                ${thumbnail_text}
                <div class="mx-2">
                    <span style="font-weight:bold" class="text-reset">${title_safe}</span>
                    <div class="text-reset">
                        ${source__title} ${date_published} ${author}
                    </div>
                    ${tags}
                </div>

                <div class="mx-2 ms-auto">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
                  ${badge_dead}
                </div>
            </div>
        </a>
    `;
}


function entrySearchEngineTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getEntryVotesBadge(entry);
    let badge_star = highlight_bookmarks ? getEntryBookmarkBadge(entry) : "";
    let badge_age = getEntryAgeBadge(entry);
    let badge_dead = getEntryDeadBadge(entry);
   
    let invalid_style = isEntryValid(entry) ? `` : `style="opacity: 0.5"`;
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = getEntryThumbnail(entry);

    let thumbnail_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                <img src="${thumbnail}" class="rounded ${iconClass}"/>
            </div>`;
    }
    let tags_text = getEntryTags(entry);
    let tags = `<div class="text-reset mx-2">${tags_text}</div>`;
    let title_safe = getEntryTitleSafe(entry);
    let entry_link = getEntryLink(entry);
    let hover_title = title_safe + " " + tags_text;
    let link = entry.link;

    let link_text = getEntryLinkText(entry);

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            ${invalid_style}
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
               ${thumbnail_text}
               <div class="mx-2">
                  <span style="font-weight:bold" class="text-reset">${title_safe}</span>
                  ${link_text}
                  ${tags}
               </div>

               <div class="mx-2 ms-auto">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
                  ${badge_dead}
               </div>
            </div>
        </a>
    `;
}


function entryGalleryTemplate(entry, show_icons = true, small_icons = false) {
    if (isMobile()) {
        return entryGalleryTemplateMobile(entry, show_icons, small_icons);
    }
    else {
        return entryGalleryTemplateDesktop(entry, show_icons, small_icons);
    }
}


function entryGalleryTemplateDesktop(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;
    
    let badge_text = getEntryVotesBadge(entry, true);
    let badge_star = getEntryBookmarkBadge(entry, true);
    let badge_age = getEntryAgeBadge(entry, true);
    let badge_dead = getEntryDeadBadge(entry);

    let invalid_style = isEntryValid(entry) ? `` : `opacity: 0.5`;
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = getEntryThumbnail(entry);
    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%;max-height:100%;aspect-ratio:3/4;object-fit:cover;"/>
        <div class="ms-auto">
            ${badge_text}
            ${badge_star}
            ${badge_age}
            ${badge_dead}
        </div>
    `;

    let tags_text = getEntryTags(entry);
    let tags = `<div class="text-reset mx-2">${tags_text}</div>`;

    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;
    let entry_link = getEntryLink(entry);
    let source__title = getEntrySourceTitle(entry);

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            class="list-group-item list-group-item-action m-1 border rounded p-2"
            style="text-overflow: ellipsis; max-width: 18%; min-width: 18%; width: auto; aspect-ratio: 1 / 1; text-decoration: none; display:flex; flex-direction:column; ${invalid_style}"
        >
            <div style="display: flex; flex-direction:column; align-content:normal; height:100%">
                <div style="flex: 0 0 70%; flex-shrink: 0;flex-grow:0;max-height:70%">
                    ${thumbnail_text}
                </div>
                <div style="flex: 0 0 30%; flex-shrink: 0;flex-grow:0;max-height:30%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    <span style="font-weight: bold" class="text-primary">${title_safe}</span>
                    <div class="link-list-item-description">${source__title}</div>
                    ${tags}
                </div>
            </div>
        </a>
    `;
}


function entryGalleryTemplateMobile(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;
    
    let badge_text = getEntryVotesBadge(entry, true);
    let badge_star = getEntryBookmarkBadge(entry, true);
    let badge_age = getEntryAgeBadge(entry, true);
    let badge_dead = getEntryDeadBadge(entry);

    let invalid_style = isEntryValid(entry) ? `` : `opacity: 0.5`;
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = getEntryThumbnail(entry);
    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%; max-height:100%; object-fit:cover"/>
        ${badge_text}
        ${badge_star}
        ${badge_age}
        ${badge_dead}
    `;

    let tags_text = getEntryTags(entry);
    let tags = `<div class="text-reset mx-2">${tags_text}</div>`;

    let source__title = getEntrySourceTitle(entry);
    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;

    let entry_link = getEntryLink(entry);

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            class="list-group-item list-group-item-action border rounded p-2"
            style="text-overflow: ellipsis; max-width: 100%; min-width: 100%; width: auto; aspect-ratio: 1 / 1; text-decoration: none; display:flex; flex-direction:column; ${invalid_style} ${bookmark_class}"
        >
            <div style="display: flex; flex-direction:column; align-content:normal; height:100%">
                <div style="flex: 0 0 70%; flex-shrink: 0;flex-grow:0;max-height:70%">
                    ${thumbnail_text}
                </div>
                <div style="flex: 0 0 30%; flex-shrink: 0;flex-grow:0;max-height:30%">
                    <span style="font-weight: bold" class="text-primary">${title_safe}</span>
                    <div class="link-list-item-description">${source__title}</div>
                    ${tags}
                </div>
            </div>
        </a>
    `;
}


function getEntry(entry_id) {
    let filteredEntries = object_list_data.entries.filter(entry =>
        entry.id == entry_id
    );
    if (filteredEntries.length === 0) {
        return null;
    }

    return filteredEntries[0];
}



function getEntryListText(entry) {
    if (entry.link) {
       return getOneEntryEntryText(entry);
    }
    if (entry.url) {
       return getOneEntrySourceText(entry);
    }
}


function getEntriesList(entries) {
    let htmlOutput = '';

    htmlOutput = `  <span class="container list-group">`;

    if (view_display_type == "gallery") {
        htmlOutput += `  <span class="d-flex flex-wrap">`;
    }

    if (entries && entries.length > 0) {
        entries.forEach((entry) => {
            const listItem = getEntryListText(entry);

            if (listItem) {
                htmlOutput += listItem;
            }
        });
    } else {
        htmlOutput = '<li class="list-group-item">No entries found</li>';
    }

    if (view_display_type == "gallery") {
        htmlOutput += `</span>`;
    }

    htmlOutput += `</span>`;

    return htmlOutput;
}


function getOneEntryEntryText(entry) {
    const templateMap = {
        "standard": entryStandardTemplate,
        "gallery": entryGalleryTemplate,
        "search-engine": entrySearchEngineTemplate
    };

    const templateFunc = templateMap[view_display_type];
    if (!templateFunc) {
        return;
    }
    var template_text = templateFunc(entry, view_show_icons, view_small_icons);

    return template_text;
}


/** 
 * JSON files
 */

function isEntrySearchHit(entry, searchText) {
    if (entry.link) {
        return isEntrySearchHitEntry(entry, searchText);
    }
}


function isEntrySearchHitEntry(entry, searchText) {
    if (!entry)
        return false;

    if (searchText.includes("=")) {
        return isEntrySearchHitAdvanced(entry, searchText);
    }
    else {
        return isEntrySearchHitGeneric(entry, searchText);
    }
}


function isEntrySearchHitGeneric(entry, searchText) {
    if (entry.link && entry.link.toLowerCase().includes(searchText.toLowerCase()))
        return true;

    if (entry.title && entry.title.toLowerCase().includes(searchText.toLowerCase()))
        return true;

    if (entry.description && entry.description.toLowerCase().includes(searchText.toLowerCase()))
        return true;

    if (entry.tags && Array.isArray(entry.tags)) {
        const tagMatch = entry.tags.some(tag =>
            tag.toLowerCase().includes(searchText.toLowerCase())
        );
        if (tagMatch) return true;
    }

    return false;
}


function isEntrySearchHitAdvanced(entry, searchText) {
    let operator_0 = null;
    let operator_1 = null;
    let operator_2 = null;

    if (searchText.includes("==")) {
        const result = searchText.split("==");
        operator_0 = result[0].trim();
        operator_1 = "==";
        operator_2 = result[1].trim();
    }
    else {
        const result = searchText.split("=");
        operator_0 = result[0].trim();
        operator_1 = "=";
        operator_2 = result[1].trim();
    }

    if (operator_0 == "title")
    {
        if (operator_1 == "=" && entry.title && entry.title.toLowerCase().includes(operator_2.toLowerCase()))
            return true;
        if (operator_1 == "==" && entry.title && entry.title.toLowerCase() == operator_2.toLowerCase())
            return true;
    }
    if (operator_0 == "link")
    {
        if (operator_1 == "=" && entry.link && entry.link.toLowerCase().includes(operator_2.toLowerCase()))
            return true;
        if (operator_1 == "==" && entry.link && entry.link.toLowerCase() == operator_2.toLowerCase())
            return true;
    }
    if (operator_0 == "description")
    {
        if (operator_1 == "=" && entry.description && entry.description.toLowerCase().includes(operator_2.toLowerCase()))
            return true;
        if (operator_1 == "==" && entry.description && entry.description.toLowerCase() == operator_2.toLowerCase())
            return true;
    }
    if (operator_0 == "tag")
    {
        if (entry.tags && Array.isArray(entry.tags)) {
            if (operator_1 == "=") {
                const tagMatch = entry.tags.some(tag =>
                    tag.toLowerCase().includes(operator_2.toLowerCase())
                );
                if (tagMatch) return true;
            }
            if (operator_1 == "==") {
                const tagMatch = entry.tags.some(tag =>
                    tag.toLowerCase() == operator_2.toLowerCase()
                );
                if (tagMatch) return true;
            }
        }
    }
} 

function sortEntries(entries) {
    if (sort_function == "page_rating_votes") {
        entries = entries.sort((a, b) => {
            return a.page_rating_votes - b.page_rating_votes;
        });
    }
    else if (sort_function == "-page_rating_votes") {
        entries = entries.sort((a, b) => {
            return b.page_rating_votes - a.page_rating_votes;
        });
    }
    else if (sort_function == "-date_published") {
        entries = entries.sort((a, b) => {
            if (a.date_published === null && b.date_published === null) {
                return 0;
            }
            if (a.date_published === null) {
                return 1;
            }
            if (b.date_published === null) {
                return -1;
            }
            return new Date(b.date_published) - new Date(a.date_published);
        });
    }
    else if (sort_function == "date_published") {
        entries = entries.sort((a, b) => {
            if (a.date_published === null && b.date_published === null) {
                return 0;
            }
            if (a.date_published === null) {
                return -1;
            }
            if (b.date_published === null) {
                return 1;
            }
            return new Date(a.date_published) - new Date(b.date_published);
        });
    }

    return entries;
}


/*
module.exports = {
    getEntryTags,
    getEntryListText,
    isStatusCodeValid,
};
*/
