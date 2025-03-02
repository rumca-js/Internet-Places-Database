
function fillOneEntryLink(entry) {
    let datePublished = new Date(entry.date_published);
    if (isNaN(datePublished)) {
        datePublished = new Date();
    }

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

    let thumbnail = entry.thumbnail;
    let page_rating_votes = entry.page_rating_votes;
    let page_rating_contents = entry.page_rating_contents;

    let entry_link = `/preview.html?entry_id=${entry.id}`;
    file = getQueryParam("file") || "top";
    entry_link += `&file=${file}`;

    title = escapeHtml(entry.title)

    let title_safe = "";
    if (entry.title_safe) {
       title_safe = escapeHtml(entry.title_safe)
    }
    else
    {
       title_safe = escapeHtml(entry.title)
    }
    let tags_text = getEntryTags(entry);
    let hover_title = title_safe + " " + tags_text;

    let source__title = "";
    if (entry.source__title) {
       source__title = escapeHtml(entry.source__title)
    }

    // Replace all occurrences of the placeholders using a global regular expression
    let listItem = template_text
        .replace(/{link_absolute}/g, entry.link_absolute)
        .replace(/{link}/g, entry.link)
        .replace(/{entry_link}/g, entry_link)
        .replace(/{hover_title}/g, hover_title)
        .replace(/{thumbnail}/g, entry.thumbnail)
        .replace(/{title_safe}/g, title_safe)
        .replace(/{tags_text}/g, tags_text)
        .replace(/{page_rating_votes}/g, entry.page_rating_votes)
        .replace(/{page_rating_contents}/g, entry.page_rating_contents)
        .replace(/{page_rating}/g, entry.page_rating)
        .replace(/{source__title}/g, source__title)
        .replace(/{age}/g, entry.age)
        .replace(/{date_published}/g, datePublished.toLocaleString());

    return listItem;
}




function isEntrySearchHit(entry, searchText) {
    if (entry.link) {
        return isEntrySearchHitEntry(entry, searchText);
    }
    if (entry.url) {
        return isEntrySearchHitSource(entry, searchText);
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
