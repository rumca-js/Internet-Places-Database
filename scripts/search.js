
function isEntrySearchHit(entry, searchText) {
    if (!entry || !searchText) return false;

    // Split by OR
    const orGroups = searchText.split("|").map(s => s.trim());

    // Any OR group must match
    return orGroups.some(orGroup => {
        // Split by AND
        const andConditions = orGroup.split("&").map(s => s.trim());

        // All AND conditions must match
        return andConditions.every(condition =>
            isSingleConditionMatch(entry, condition)
        );
    });
}


function isSingleConditionMatch(entry, searchText) {
    if (searchText.includes("=")) {
        return isEntrySearchHitAdvanced(entry, searchText);
    }
    return isEntrySearchHitGeneric(entry, searchText);
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
    if (!entry) return false;

    let field, operator, value;

    if (searchText.includes("==")) {
        [field, value] = searchText.split("==");
        operator = "==";
    } else {
        [field, value] = searchText.split("=");
        operator = "=";
    }

    field = field.trim();
    value = value.trim().toLowerCase();

    // Special handling for tags
    if (field === "tag" && Array.isArray(entry.tags)) {
        return entry.tags.some(tag => {
            const t = tag.toLowerCase();
            return operator === "==" ? t === value : t.includes(value);
        });
    }

    const lookup = {
        title: entry.title,
        link: entry.link,
        description: entry.description,
        language: entry.language
    };

    const target = lookup[field];
    if (!target) return false;

    const targetText = target.toLowerCase();

    return operator === "=="
        ? targetText === value
        : targetText.includes(value);
}


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


