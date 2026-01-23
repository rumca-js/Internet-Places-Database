/*
 * requires
 *  - show_pure_link
 *  - highlight_bookmarks
 */


function isStatusCodeValid(entry) {
    if (entry.status_code >= 200 && entry.status_code < 400)
        return true;

    // user agent, means that something is valid, but behind paywall
    if (entry.status_code == 403)
        return true;

    return false;
}


function isStatusCodeInValid(entry) {
    // user agent, means that something is valid, but behind paywall
    if (entry.status_code == 403)
        return false;

    if (entry.status_code < 200 && entry.status_code >= 400)
        return true;

    return false;
}


function isEntryValid(entry) {
    if (entry.is_valid == null) {
        if (isStatusCodeValid(entry) || entry.manual_status_code == 200) {
           return true;
        }
        return false;
    }
    return entry.is_valid;
}


function isEntryInValid(entry) {
    if (entry.is_valid == null) {
        if (entry.manual_status_code == 200) {
            return false;
        }
        if (isStatusCodeInValid(entry)) {
           return true;
        }
        return false;
    }
    return !entry.is_valid;
}


function getEntryLink(entry) {
    if (entries_direct_links)
    {
        if (entry.link) {
           return entry.link;
	}
        return `?entry_id=${entry.id}`;
    }
    else {
        return `?entry_id=${entry.id}`;
    }
}


function canUserView(entry) {
    if (entry.age == 0 || entry.age == null)
        return true;

    if (entry.age < user_age)
        return true;

    return false;
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


function getEntryReadLaterBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 60px;" + style;
    }

    let badge_text = entry.read_later ? `
        <span class="badge text-bg-warning" style="${style}" title="Check Later">
           L
        </span>` : '';
    return badge_text;
}


function getEntryVisitedBadge(entry, overflow=false) {
    let style = "font-size: 0.8rem;"
    if (overflow) {
        style = "position: absolute; top: 30px; right: 60px;" + style;
    }

    let badge_text = entry.visited ? `
        <span class="badge text-bg-warning" style="${style}" title="Visited">
           V
        </span>` : '';
    return badge_text;
}


function getEntrySocialDataText(data) {
   let html_out = "";

   let { thumbs_up, thumbs_down, view_count, upvote_ratio, upvote_diff, upvote_view_ratio, stars, followers_count } = data;

   if (thumbs_up != null && thumbs_down != null && view_count != null) {
      if (thumbs_up != null) html_out += `<span class="text-nowrap mx-1">👍${getHumanReadableNumber(thumbs_up)}</span>`;
      if (thumbs_down != null) html_out += `<span class="text-nowrap mx-1">👎${getHumanReadableNumber(thumbs_down)}</span>`;
      if (view_count != null) html_out += `<span class="text-nowrap mx-1">👁${getHumanReadableNumber(view_count)}</span>`;
   }
   else {
      if (thumbs_up != null) html_out += `<span class="text-nowrap mx-1">👍${getHumanReadableNumber(thumbs_up)}</span>`;
      if (thumbs_down != null) html_out += `<span class="text-nowrap mx-1">👎${getHumanReadableNumber(thumbs_down)}</span>`;
      if (view_count != null) html_out += `<span class="text-nowrap mx-1">👁${getHumanReadableNumber(view_count)}</span>`;
      if (stars != null) html_out += `<span class="text-nowrap mx-1">⭐${getHumanReadableNumber(stars)}</span>`;
      if (followers_count != null) html_out += `<span class="text-nowrap mx-1">👥${getHumanReadableNumber(followers_count)}</span>`;
    
      if (upvote_diff != null) html_out += `<span class="text-nowrap mx-1">👍-👎${getHumanReadableNumber(upvote_diff)}</span>`;
      if (upvote_ratio != null) html_out += `<span class="text-nowrap mx-1">👍/👎${parseFloat(upvote_ratio).toFixed(2)}</span>`;
      if (upvote_view_ratio != null) html_out += `<span class="text-nowrap mx-1">👍/👁${parseFloat(upvote_view_ratio).toFixed(2)}</span>`;
   }

   return html_out;
}


function FillSocialData(entry_id, social_data) {
    let entry_parameters = getEntrySocialDataText(social_data);

    // entry_list_social.set(entry.id, entry_parameters);

    let upvote_ratio_div = `<div>${entry_parameters}</div>`;

    $(`[entry="${entry_id}"] [entryDetails="true"]`).append(upvote_ratio_div);
}


function getEntryParameters(entry, entry_dislike_data=null) {
   html_out = "";

   let date_published = getEntryDatePublished(entry);

   html_out += `<span class="text-nowrap d-flex flex-wrap" id="entryParameters"><strong>Publish date:</strong> ${date_published}</span>`;

   html_out += getEntryBookmarkBadge(entry);
   html_out += getEntryVotesBadge(entry);
   html_out += getEntryAgeBadge(entry);
   html_out += getEntryDeadBadge(entry);
   html_out += getEntryReadLaterBadge(entry);

   if (entry_dislike_data) {
      html_out += getEntrySocialDataText(entry_dislike_data);
   }
   else {
      html_out += getEntrySocialDataText(entry);
   }

   return html_out;
}


function getEntryThumbnail(entry) {
    if (!canUserView(entry))
    {
        return;
    }

    let thumbnail = entry.thumbnail;

    return thumbnail;
}


function getEntryFavicon(entry) {
    if (!canUserView(entry))
    {
        return;
    }

    let thumbnail = entry.favicon;

    return thumbnail;
}


function getEntryThumbnailOrFavicon(entry) {
    if (!canUserView(entry))
    {
        return;
    }

    let thumbnail = entry.thumbnail;
    if (thumbnail == null) {
        thumbnail = entry.favicon;
    }

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

    if (source_title && source_url) {
        html += `<a href="${source_url}" title="${source_url}">${source_title}</a>`;
    }
    else if (source_url) {
        html += `<a href="${source_url}" title="${source_url}">Source URL</a>`;
    }
    else if (source_title) {
        html += `<span>${source_title}</span>`;
    }

    if (entry.source_url) {
       let channel_url = getChannelUrl(entry.source_url);
       if (channel_url) {
           html += `<a href="${channel_url}" title="${channel_url}">Channel</a>`;
       }
    }

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


function getEntryDate(date_string) {
    let datePublishedStr = "";
    if (date_string) {
        let datePublished = new Date(date_string);
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


function getEntryAuthorSafe(entry) {
    let author = entry.author;
    return escapeHtml(entry.author);
}


function getEntryAuthorText(entry) {
    if (entry.author && entry.album)
    {
        return getEntryAuthorSafe(entry) + " / " + entry.album;
    }
    else if (entry.author) {
        return getEntryAuthorSafe(entry);
    }
    else if (entry.album) {
        return entry.album;
    }
    return "";
}


function getEntryDescription(entry) {
  if (!entry.description)
    return "";

  const content = new ContentDisplay(entry.description);
  let content_text = content.htmlify();

  content_text = content_text.replace(/(\r\n|\r|\n)/g, "<br>");
  return content_text;
}


function getEntryDescriptionSafe(entry) {
  if (!entry.description)
    return "";

  let content = new ContentDisplay(entry.description);
  let content_text = content.nohtml();

  content = new ContentDisplay(content_text);
  content_text = content.noattrs();

  content = new ContentDisplay(content_text);
  content_text = content.linkify();

  if (entry.thumbnail != null) {
    content = new ContentDisplay(content_text);
    content_text = content.removeImgs(entry.thumbnail);
  }

  content_text = content_text.replace(/(\r\n|\r|\n)/g, "<br>");
  return content_text;
}


/**
 * Detail view
 */


function getEntryDetailText(entry) {
    let text = getEntryDetailPreview(entry);

    text += getEntryBodyText(entry);

    return text;
}


function getEntryDetailPreview(entry) {
    let handler_yt = new YouTubeVideoHandler(entry.link);
    let handler_od = new OdyseeVideoHandler(entry.link);

    if (handler_yt.isHandledBy())
    {
        return getEntryDetailYouTubePreview(entry);
    }
    else if (handler_od.isHandledBy())
    {
        return getEntryDetailOdyseePreview(entry);
    }
    return getEntryDetailThumbnailPreview(entry);
}


function getEntryBodyText(entry) {
    let date_published = parseDate(entry.date_published);
    let parameters = getEntryParameters(entry);

    let text = `
    <a href="${entry.link}"><h1>${entry.title}</h1></a>
    <div><a href="${entry.link}">${entry.link}</a></div>
    ${parameters}
    `;

    let tags_text = getEntryTagStrings(entry);
    
    if (tags_text) {
       text += `
           <div>Tags: ${tags_text}</div>
       `;
    }

    text += getViewMenu(entry);

    let description = getEntryDescriptionSafe(entry);

    text += `
    <div>${description}</div>
    `;

    text += getEntryOpParameters(entry);

    return text;
}


function getEntryDetailTags(entry) {
   tag_string = "";

   if (entry.tags && entry.tags.length > 0 ) {
      entry.tags.forEach(tag => {
         tag_string += getEntryTagLink(tag);
      });
   }

   return tag_string;
}


"Fixed manu entry - TODO provide a button class instances and call other formatting functions below"
function getViewMenu(entry) {
    let link = entry.link;

    links = GetAllServicableLinks(link);

    let source_url = getEntrySourceUrl(entry);
    if (source_url != null) {
        links.push({
           name: `Source - ${source_url}`,
           link: source_url
        });

        let channel_url = getChannelUrl(source_url);
        if (channel_url && channel_url != source_url) {
            links.push({
               name: `Channel - ${channel_url}`,
               link: channel_url
            });
	}

        const handler = getUrlHandler(source_url);
        if (handler)
        {
           const feeds = handler.getFeeds();
           for (const feed of feeds) {
               const safeFeed = sanitizeLink(feed);
               if (safeFeed && safeFeed != source_url) {
                  links.push({
                      name: `RSS - ${safeFeed}`,
                      link: safeFeed
                  });
	       }
           }
        }
    }

    let html = 
    `<div class="dropdown">
        <button class="btn btn-primary" type="button" id="#entryViewDrop${entry.id}" data-bs-toggle="dropdown" aria-expanded="false">
          View
        </button>
        <ul class="dropdown-menu">`;

    links.forEach(function(item) {
       html += ` <li>
          <a href="${item.link}" id="Edit" class="dropdown-item" title="${item.name}">
             ${item.name}
          </a>
        </li>
	    `;
    });

    html += `</ul></div>`;

    return html;
}


function getMenuButtonText(button) {
    let button_image_text = "";
    if (button.image) {
       button_image_text = `<img src="${button.image}" class="content-icon" />`;
    }

    return `
     	 <li>
             <a href="${button.action}" id="${button.id}" class="dropdown-item" title="${button.title}">
	       ${button_image_text}
               ${button.name}
             </a>
         </li>
     `;
}


function getMenuEntry(menu_entry) {

    let buttons_text = "";
    menu_entry.buttons.forEach(button => {
	buttons_text += getMenuButtonText(button);
    });


     let menu_entry_text = `<div class="dropdown mx-2">
        <button class="btn btn-primary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
	  ${menu_entry.name}
        </button>
     
        <ul class="dropdown-menu">
	   ${buttons_text}
        </ul>
     </div>`

     return menu_entry_text;
}


function getMenuEntries(menu_entries) {
    text = "";
    menu_entries.forEach(menu_entry => {
       text += getMenuEntry(menu_entry);
    });
    return text;
}


function getEntryOpParameters(entry) {
    text = "";

    text += `
    <h3>Parameters</h3>
    <div title="Points:Page rating|User rating|Page contents rating|Number of total visits">Points: ${entry.page_rating}|${entry.page_rating_votes}|${entry.page_rating_contents}|${entry.page_rating_visits}</div>
    `;

    if (entry.date_created) {
        date_created = parseDate(entry.date_created);
        text += `<div>Creation date:${date_created}</div>`;
    }

    if (entry.date_update_last) {
        date_updated = parseDate(entry.date_update_last);
        text += `<div>Update date:${date_updated}</div>`;
    }
    if (entry.date_last_modified) {
        date_last_modified = parseDate(entry.date_last_modified);
        text += `<div>Last modified:${date_last_modified}</div>`;
    }

    if (entry.date_dead_since) {
        date_dead_since = parseDate(entry.date_dead_since);
        text += `<div>Dead since:${date_dead_since}</div>`;
    }

    if (entry.author) {
        let author = getEntryAuthorSafe(entry);
        text += `<div>Author: ${author}</div>`;
    }
    if (entry.album) {
        text += `<div>Album: ${entry.album}</div>`;
    }

    if (entry.status_code_str) {
       text += `<div>Status code: ${entry.status_code_str}</div>`;
    }
    else if (entry.status_code) {
       text += `<div>Status code: ${entry.status_code}</div>`;
    }
    if (entry.manual_status_code) {
       text += `
       <div>Manual status code: ${entry.manual_status_code}</div>
       `;
    }

    text += `
    <div>Language: ${entry.language}</div>
    `;

    if (entry.age) {
       text += `
       <div>Age: ${entry.age}</div>
       `;
    }

    if (entry.visits) {
       text += `
       <div>Visits: ${entry.visits}</div>
       `;
    }
    if (entry.last_browser) {
       text += `
       <div>Last browser: ${entry.last_browser}</div>
       `;
    }
    if (entry.contents_hash) {
       let hash = escapeHtml(entry.contents_hash);
       text += `
       <div>Contents hash: ${hash}</div>
       `;
    }
    if (entry.meta_hash) {
       let hash = escapeHtml(entry.meta_hash);
       text += `
       <div>Meta hash: ${hash}</div>
       `;
    }
    if (entry.body_hash) {
       let hash = escapeHtml(entry.body_hash);
       text += `
       <div>Body hash: ${hash}</div>
       `;
    }
    if (entry.permanent != null) {
       text += `<div>Permanent: ${entry.permanent}</div>`;
    }
    if (entry.user_bookmarked != null) {
       text += `<div>User Bookmarked: ${entry.user_bookmarked}</div>`;
    }
    if (entry.user_visits != null) {
       text += `<div>User Visits: ${entry.user_visits}</div>`;
    }
    if (entry.thumbnail != null) {
       text += `<div><a href="${entry.thumbnail}">Thumbnail</a></div>`;
    }

    return text;
}


function getEntryDetailThumbnailPreview(entry, center=false) {
    let div_style = "";
    if (center) {
      div_style = 'text-align:center;';
    }


    let text = "";
    if (entry.thumbnail) {
       text = `<div entry="${entry.id}" class="entry-detail" style="${div_style}">`;

       text += `
       <div><img src="" style="max-width:30%;"/></div>
       `;

       text += "</div>";

       if (canUserView(entry))
       {
          text = `
          <div style="${div_style}"><img src="${entry.thumbnail}" style="max-width:30%;"/></div>
          `;
       }
    }

    return text;
}


function getEntryDetailYouTubePreview(entry) {
    let handler = new YouTubeVideoHandler(entry.link);
    if (!handler.isHandledBy())
    {
        return;
    }

    const embedUrl = handler.getEmbedUrl();

    return `
      <div class="youtube_player_container">
          <iframe src="${embedUrl}" frameborder="0" allowfullscreen class="youtube_player_frame" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
    `;
}


function getEntryDetailOdyseePreview(entry) {
    let handler = new OdyseeVideoHandler(entry.link);
    if (!handler.isHandledBy())
    {
        return;
    }

    const embedUrl = handler.getEmbedUrl();

    let text = `<div entry="${entry.id}" class="entry-detail">`;

    if (videoId) {
        text += `
           <div class="youtube_player_container">
               <iframe style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;" width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"></iframe>
           </div>
        `;
    }

    return text;
}


/**
 * Entry list items
 */


function getOneEntryEntryText(entry) {
    const templateMap = {
        "standard": entryStandardTemplate,
        "gallery": entryGalleryTemplate,
        "search-engine": entrySearchEngineTemplate,
        "content-centric": entryContentCentricTemplate,
        "accordion": entryAccordionTemplate,
        "read-later": getEntryReadLaterBar,
        "realated": getEntryRelatedBar,
        "visits": getEntryVisitsBar,
        "text": getEntryTextBar,
        "links-only": getEntryLinkTemplate,
    };

    const templateFunc = templateMap[view_display_type];
    if (!templateFunc) {
        return;
    }
    var template_text = templateFunc(entry, view_show_icons, view_small_icons);

    return template_text;
}


function getEntryTagStrings(entry) {
   tag_string = "";
   if (entry.tags && entry.tags.length > 0 ) {
	tag_string = entry.tags.map(tag => `#${tag}`).join(",");
   }

   return tag_string;
}


`
 - If this is not valid, then we have display style to dead
 - if entry was visited it is opaque
    - but if entry is bookmarked we do not want to make it more or less opaque
    - bookmarked was always visited, and should be visible
`
function getEntryDisplayStyle(entry, mark_visited=true) {
    let display_style = "";
    let opacity = null;

    if (entry.alpha)
    {
        opacity = entry.alpha;
    }

    if (entries_visit_alpha && !entry.bookmarked && entry.visited)
    {
        opacity = entries_visit_alpha;
    }

    if (isEntryInValid(entry))
    {
        opacity = entries_dead_alpha;
    }

    // apply

    if (opacity)
    {
       display_style += `opacity: ${opacity};`;
    }

    if (entry.backgroundcolor) {
        let alpha = entry.backgroundcolor_alpha !== undefined ? entry.backgroundcolor_alpha : 1;
        const [r, g, b] = hexToRgb(entry.backgroundcolor);
        display_style += `background-color: rgba(${r}, ${g}, ${b}, ${alpha});`;
    }

    return display_style;
}


function getEntryThumbnailBadge(entry, img_location, small_icons=false) {
    if (view_show_icons == null) {
        return "";
    }

    let thumbnail = img_location;

    const iconClass = small_icons ? 'icon-small' : 'icon-normal';
    let img_text = `<img src="${thumbnail}" class="rounded ${iconClass}" />`;
    
    thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                ${img_text}
            </div>`;
}


function entryStandardTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getEntryVotesBadge(entry);
    let badge_star = getEntryBookmarkBadge(entry);
    let badge_age = getEntryAgeBadge(entry);
    let badge_dead = getEntryDeadBadge(entry);
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);

    let invalid_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';
    let thumbnail = getEntryThumbnailOrFavicon(entry);

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
    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }
    let source__title = getEntrySourceTitle(entry);
    let date_published = getEntryDatePublished(entry);
    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;
    let entry_link = getEntryLink(entry);
    let social = getEntrySocialDataText(entry);

    let author = entry.author;
    if (author && author != source__title)
    {
       author = "by " + getEntryAuthorText(entry);
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
            style="${invalid_style}"
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
                ${thumbnail_text}
                <div class="mx-2">
                    <span style="font-weight:bold" class="text-reset" entryTitle="true">${title_safe}</span>
                    <div 
                      class="text-reset"
                       entryDetails="true"
                    >
                        ${source__title} ${date_published} ${author}
                    </div>
                    <div class="text-reset mx-2">${tags_text} ${language_text}</div>
                    <div class="entry-social">${social}</div>
                </div>

                <div class="mx-2 ms-auto" entryBadges="true">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
                  ${badge_dead}
                  ${badge_read_later}
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
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);
   
    let invalid_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = getEntryThumbnailOrFavicon(entry);

    let thumbnail_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                <img src="${thumbnail}" class="rounded ${iconClass}"/>
            </div>`;
    }
    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }
    let title_safe = getEntryTitleSafe(entry);
    let entry_link = getEntryLink(entry);
    let hover_title = title_safe + " " + tags_text;
    let link = entry.link;
    let social = getEntrySocialDataText(entry);

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            style="${invalid_style}"
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <div class="d-flex">
               ${thumbnail_text}
               <div class="mx-2">
                  <span style="font-weight:bold" class="text-reset" entryTitle="true">${title_safe}</span>
                  <div class="text-reset text-decoration-underline" entryDetails="true">@ ${entry.link}</div>
                  <div class="text-reset mx-2">${tags_text} ${language_text}</div>
                  <div class="entry-social">${social}</div>
               </div>

               <div class="mx-2 ms-auto">
                  ${badge_text}
                  ${badge_star}
                  ${badge_age}
                  ${badge_dead}
                  ${badge_read_later}
               </div>
            </div>
        </a>
    `;
}


function entryAccordionTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getEntryVotesBadge(entry);
    let badge_star = highlight_bookmarks ? getEntryBookmarkBadge(entry) : "";
    let badge_age = getEntryAgeBadge(entry);
    let badge_dead = getEntryDeadBadge(entry);
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);
   
    let entry_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `` : '';

    let thumbnail = getEntryThumbnailOrFavicon(entry);

    let thumbnail_text = '';
    if (show_icons) {
        const iconClass = small_icons ? 'icon-small' : 'icon-normal';
        thumbnail_text = `
            <div style="position: relative; display: inline-block;">
                <img src="${thumbnail}" class="rounded ${iconClass}"/>
            </div>`;
    }
    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }
    let title_safe = getEntryTitleSafe(entry);
    let entry_link = getEntryLink(entry);
    let hover_title = title_safe + " " + tags_text;
    let link = entry.link;
    let social = getEntrySocialDataText(entry);
    let preview_text = getEntryDetailThumbnailPreview(entry, center=true);
    let detail_text = getEntryBodyText(entry);

    return `
      <div class="accordion-item my-1 p-1">
        <h2 class="accordion-header" id="heading-${entry.id}">
           <button
               entry="${entry.id}"
               title="${hover_title}"
               class="accordion-button ${bookmark_class}"
               type="button"
               data-bs-toggle="collapse"
               data-bs-target="#collapse-${entry.id}"
           >
               <div class="d-flex">
                  ${thumbnail_text}
                  <div class="mx-2">
                     <span style="font-weight:bold" class="text-reset" entryTitle="true">${title_safe}</span>
                     <div class="text-reset text-decoration-underline" entryDetails="true">@ ${entry.link}</div>
                     <div class="text-reset mx-2">${tags_text} ${language_text}</div>
                     <div class="entry-social">${social}</div>
                  </div>

                  <div class="mx-2 ms-auto">
                     ${badge_text}
                     ${badge_star}
                     ${badge_age}
                     ${badge_dead}
                     ${badge_read_later}
                  </div>
               </div>
           </button>
        </h2>
        <div id="collapse-${entry.id}" class="accordion-collapse collapse" data-bs-parent="#accordion-parent">
          <div class="accordion-body">
	     ${preview_text}
             ${detail_text}
          </div>
        </div>
      </div>
    `;
}


function getEntryLinkTemplate(entry, show_icons = true, small_icons = false) {
    let tags_text = getEntryTagStrings(entry);
    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;

    return `
        <div
            href="${entry.link}"
            entry="${entry.id}"
            title="${hover_title}"
         >
            ${entry.link}
        </div>
    `;
}


function entryContentCentricTemplate(entry, show_icons = true, small_icons = false) {
    let page_rating_votes = entry.page_rating_votes;

    let badge_text = getEntryVotesBadge(entry);
    let badge_star = highlight_bookmarks ? getEntryBookmarkBadge(entry) : "";
    let badge_age = getEntryAgeBadge(entry);
    let badge_dead = getEntryDeadBadge(entry);
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);
   
    let invalid_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';
    let source_info = getEntrySourceInfo(entry);

    let thumbnail = getEntryThumbnail(entry);
    let img_badge = "";
    if (!thumbnail) {
       img_badge = getEntryThumbnailBadge()
    }

    let thumbnail_text = '';
    if (show_icons && thumbnail) {
        const iconClass = small_icons ? 'icon-normal' : 'icon-big';
        if (isMobile()) {
           thumbnail_text = `
               <div style="position: relative; display: inline-block; width:100%;">
                   <img src="${thumbnail}" style="width:100%; max-height:100%; min-width:20%; object-fit:cover"/>
               </div>`;
	}
        else {
           thumbnail_text = `
               <div style="position: relative; display: inline-block; width:100%;">
                   <img src="${thumbnail}" style="width:40%; max-height:100%; min-width:20%; object-fit:cover"/>
               </div>`;
	}
    }
    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }
    let title_safe = getEntryTitleSafe(entry);
    let entry_link = getEntryLink(entry);
    let hover_title = title_safe + " " + tags_text;
    let link = entry.link;
    let description = getEntryDescriptionSafe(entry);
    let view_menu = getViewMenu(entry);
    let social = getEntrySocialDataText(entry);

    return `
        <div 
            entry="${entry.id}"
            style="${invalid_style} text-decoration: none"
            class="my-1 p-1 list-group-item list-group-item-action ${bookmark_class} border rounded"
        >
            <a class="d-flex mx-2"
               href="${entry_link}"
               title="${hover_title}"
            >
               <div class="text-wrap">
                  <span style="font-weight:bold" class="h3 text-body" entryTitle="true">${title_safe}</span>
                  <div class="text-body text-decoration-underline">@ ${entry.link}</div>
               </div>
            </a>

            <div class="mx-2" style="text-align:center;">
               <a href="${entry_link}" title="${hover_title}">
               ${thumbnail_text}
               </a>
            </div>

            <!--div class="mx-2">
              ${view_menu}
            </div-->

            <div class="mx-2">
               ${source_info} ${tags_text} ${language_text}
            </div>
	    
            <div class="mx-2 entry-social">${social}</div>

            <div class="mx-2 link-detail-description">
              ${description}
            </div>

            <div class="mx-2 ms-auto">
               ${badge_text}
               ${badge_star}
               ${badge_age}
               ${badge_dead}
               ${badge_read_later}
            </div>
        </div>
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
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);

    let invalid_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = "";
    if (show_icons)
    {
       thumbnail = getEntryThumbnailOrFavicon(entry);
    }

    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%;max-height:100%;aspect-ratio:3/4;object-fit:cover;"/>
        <div class="ms-auto">
            ${badge_text}
            ${badge_star}
            ${badge_age}
            ${badge_dead}
            ${badge_read_later}
        </div>
    `;

    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }

    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;
    let entry_link = getEntryLink(entry);
    let source__title = getEntrySourceTitle(entry);
    let social = getEntrySocialDataText(entry);

    return `
        <a 
            href="${entry_link}"
            entry="${entry.id}"
            title="${hover_title}"
            class="list-group-item list-group-item-action m-1 border rounded p-2"
            style="text-overflow: ellipsis; max-width: 18%; min-width: 18%; width: auto; aspect-ratio: 1 / 1; text-decoration: none; display:flex; flex-direction:column; ${invalid_style} ${bookmark_class}"
        >
            <div style="display: flex; flex-direction:column; align-content:normal; height:100%">
                <div style="flex: 0 0 70%; flex-shrink: 0;flex-grow:0;max-height:70%" id="entryTumbnail">
                    ${thumbnail_text}
                </div>
                <div
                      style="
                      flex: 0 0 auto;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: normal;
                      line-height: 1.2em;
                      max-height: 4.8em;
                      "
                      id="entryDetails">
                    <span style="font-weight: bold" class="text-primary" entryTitle="true">${title_safe}</span>
                    <div class="link-list-item-description" entryDetails="true">${source__title}</div>
                    <div class="text-reset mx-2">${tags_text} ${language_text}</div>
                    <div class="entry-social">${social}</div>
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
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);

    let invalid_style = getEntryDisplayStyle(entry);
    let bookmark_class = (entry.bookmarked && highlight_bookmarks) ? `list-group-item-primary` : '';

    let thumbnail = "";
    if (show_icons)
    {
       thumbnail = getEntryThumbnailOrFavicon(entry);
    }
    let thumbnail_text = `
        <img src="${thumbnail}" style="width:100%; max-height:100%; object-fit:cover"/>
        ${badge_text}
        ${badge_star}
        ${badge_age}
        ${badge_dead}
        ${badge_read_later}
    `;

    let tags_text = getEntryTagStrings(entry);
    let language_text = "";
    if (entry.language != null) {
        language_text = `Language:${entry.language}`;
    }

    let source__title = getEntrySourceTitle(entry);
    let title_safe = getEntryTitleSafe(entry);
    let hover_title = title_safe + " " + tags_text;

    let entry_link = getEntryLink(entry);
    let social = getEntrySocialDataText(entry);

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
                    <span style="font-weight: bold" class="text-primary" entryTitle="true">${title_safe}</span>
                    <div class="link-list-item-description" entryDetails="true">${source__title}</div>
                    <div class="text-reset mx-2">${tags_text} ${language_text}</div>
                    <div class="entry-social">${social}</div>
                </div>
            </div>
        </a>
    `;
}


function getEntryVisitsBar(entry, show_icons=true, small_icons=true) {
    let link_absolute = entry.link_absolute;
    let id = entry.id;
    let title = entry.title;
    let title_safe = getEntryTitleSafe(entry);
    let link = entry.link;
    let thumbnail = entry.thumbnail;
    let source__title = entry.source__title;
    let date_published = getEntryDatePublished(entry);
    let date_last_visit = entry.date_last_visit.toLocaleString();
    let number_of_visits = entry.number_of_visits;

    let badge_text = getEntryVotesBadge(entry, true);
    let badge_star = getEntryBookmarkBadge(entry, true);
    let badge_age = getEntryAgeBadge(entry, true);
    let badge_dead = getEntryDeadBadge(entry, true);
    let badge_read_later = getEntryReadLaterBadge(entry);

    let img_text = '';
    if (view_show_icons) {
        const iconClass = view_small_icons ? 'icon-small' : 'icon-normal';
        img_text = `<img src="${thumbnail}" class="rounded ${iconClass}" />`;
    }
    let link_text = getEntryLinkText(entry);
    let tags_text = getEntryTagStrings(entry);

    let text = `
         <a
         class="my-1 p-1 list-group-item list-group-item-action border rounded"
         href="${link_absolute}" title="${title}">
             ${badge_text}
             ${badge_star}
             ${badge_age}
             ${badge_dead}
             ${badge_read_later}

             <div class="d-flex">
               ${img_text}

               <div class="mx-2">
                  <span style="font-weight:bold" class="text-reset" entryTitle="true">${title_safe}</span>
		  <div>
		    ${link_text}
		  </div>
		  <div>
		     ${tags_text}
		  </div>
		  <div>
                    Visits:${number_of_visits},
                    Date of the last visit:${date_last_visit}
		  </div>
               </div>
             </div>
         </a>
    `;
    return text;
}


function getEntryRelatedBar(entry, from_entry_id) {
    let link_absolute = entry.link_absolute;
    let id = entry.id;
    let title = entry.title;
    let title_safe = getEntryTitleSafe(entry);
    let link = entry.link;
    let thumbnail = entry.thumbnail;
    let source__title = entry.source__title;
    let date_published = getEntryDatePublished(entry);

    let badge_text = getEntryVotesBadge(entry, true);
    let badge_star = getEntryBookmarkBadge(entry, true);
    let badge_age = getEntryAgeBadge(entry, true);
    let badge_dead = getEntryDeadBadge(entry, true);
    let badge_read_later = getEntryReadLaterBadge(entry);
    let badge_visited = getEntryVisitedBadge(entry);

    let img_text = '';
    if (view_show_icons) {
        const iconClass = view_small_icons ? 'icon-small' : 'icon-normal';
        img_text = `<img src="${thumbnail}" class="rounded ${iconClass}" />`;
    }
    let link_text = getEntryLinkText(entry);

    let text = `
         <a
         class="list-group-item list-group-item-action"
         href="${link_absolute}?from_entry_id=${from_entry_id}" title="${title}">
             ${badge_text}
             ${badge_star}
             ${badge_age}
             ${badge_dead}
             ${badge_read_later}

             <div class="d-flex">
               ${img_text}

               <div class="mx-2">
		  <div>
        	  ${title_safe}
		  ${link_text}
		  </div>
               </div>
             </div>
         </a>
    `;
    return text;
}


function getEntryReadLaterBar(entry, show_icons=true, small_icons=true) {
    let remove_link = entry.remove_link; // manually set
    let remove_icon = entry.remove_icon; // manually set

    let link_absolute = entry.link_absolute;
    let id = entry.id;
    let title = entry.title;
    let title_safe = entry.title_safe;
    let link = entry.link;
    let thumbnail = entry.thumbnail;
    let source__title = entry.source__title;
    let date_published = entry.date_published.toLocaleString();

    let badge_text = getEntryVotesBadge(entry, true);
    let badge_star = getEntryBookmarkBadge(entry, true);
    let badge_age = getEntryAgeBadge(entry, true);
    let badge_dead = getEntryDeadBadge(entry, true);

    let img_text = '';
    if (view_show_icons) {
        const iconClass = view_small_icons ? 'icon-small' : 'icon-normal';
        img_text = `<img src="${thumbnail}" class="rounded ${iconClass}" />`;
    }
    let link_text = getEntryLinkText(entry);

    let text = `
         <div 
         class="list-group-item list-group-item-action"
	 >
             ${badge_text}
             ${badge_star}
             ${badge_age}
             ${badge_dead}

             <div class="d-flex">
	         <a href="${link_absolute}" title="${title}" class="d-flex">
		   ${img_text}
        
                   <div class="mx-2">
		      <div>
        	         ${title_safe}
			 ${link_text}
		      </div>
        	   </div>
	         </a>
        
                 <a id="${id}" class="remove-button ms-auto" href="${remove_link}" >
                    ${remove_icon}
                 </a>
             </div>
         </div>
    `;
    return text;
}


function getEntryTextBar(entry, show_icons=false, small_icons=false) {
   let htmlOutput = "";
   for (const [key, value] of Object.entries(entry)) {
       if (key != "description")
       {
           htmlOutput += `
           <div>
               <strong>${key}:</strong> ${value ?? "N/A"}
           </div>
       `;
       }
   }

   return htmlOutput;
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
    if (view_display_type == "accordion") {
        htmlOutput += `  <div class="accordion" id="accordion-parent">`;
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
    if (view_display_type == "accordion") {
        htmlOutput += `</div>`;
    }

    htmlOutput += `</span>`;

    return htmlOutput;
}


/** 
 * JSON files
 */

function sortEntries(entries) {
    console.log(`Sorting using ${sort_function}`);
    const sortFields = [
        'link',
        'title',
        'page_rating_votes',
        'followers_count',
        'stars',
        'view_count',
        'upvote_ratio',
        'upvote_diff',
        'upvote_view_ratio',
    ];

    const isDescending = sort_function.startsWith('-');
    const field = isDescending ? sort_function.slice(1) : sort_function;

    if (sort_function == "-date_published") {
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
    else if (sortFields.includes(field)) {
        entries.sort((a, b) => {
            const aVal = a[field] ?? 0;
            const bVal = b[field] ?? 0;

            return isDescending
                ? bVal - aVal
                : aVal - bVal;
        });
    }

    return entries;
}


/*
module.exports = {
    getEntryTags,
    getEntryListText,
    isStatusCodeValid,
    getEntryAuthorText,
    getEntryVotesBadge,
    getEntryBookmarkBadge,
    getEntryAgeBadge,
    getEntryDeadBadge,
    getEntryParameters,
    getEntryDetailText,
    getEntryFullTextStandard,
    getEntryFullTextYouTube,
    getEntryFullTextOdysee,
};
*/
