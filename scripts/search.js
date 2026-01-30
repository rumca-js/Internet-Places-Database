
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


