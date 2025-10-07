
class YouTubeVideoHandler {
    constructor(url) {
        this.originalUrl = url;
        this.videoId = this.extractVideoId(url);
    }

    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            if (hostname.includes("youtu.be")) {
                return urlObj.pathname.slice(1);
            }

            if (urlObj.searchParams.has("v")) {
                return urlObj.searchParams.get("v");
            }

            const paths = urlObj.pathname.split("/");
            const validPrefixes = ["embed", "shorts", "v"];
            if (validPrefixes.includes(paths[1]) && paths[2]) {
                return paths[2];
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    getUrl() {
        if (!this.videoId) return null;
        return `https://www.youtube.com/watch?v=${this.videoId}`;
    }

    isHandledBy() {
        return !!this.videoId;
    }

    getFeeds() {
       return [];
    }

    getLinkVersions() {
       return [this.getUrl()];
    }

    getPreviewHtml() {
        if (!this.videoId) return null;
    
        const embedUrl = `https://www.youtube.com/embed/${this.videoId}`;
        return `
            <div class="youtube_player_container mb-4">
                <iframe 
                    src="${embedUrl}" 
                    frameborder="0" 
                    allowfullscreen 
                    class="youtube_player_frame w-100" 
                    style="aspect-ratio: 16 / 9;"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        `;
    }

    getEmbedUrl() {
        if (!this.videoId) return null;
    
        return `https://www.youtube.com/embed/${this.videoId}`;
    }
}


class YouTubeChannelHandler {
    constructor(url) {
        this.originalUrl = url;
        this.channelId = this.extractChannelId(url);
    }

    extractChannelId(url) {
        try {
            const urlObj = new URL(url);
            const paths = urlObj.pathname.split("/").filter(Boolean);

            // Case 1: Standard channel URL
            if (paths[0] === "channel" && paths[1]) {
                return paths[1];
            }

            // Case 2: Feed URL with channel_id param
            if (
                urlObj.hostname === "www.youtube.com" &&
                paths[0] === "feeds" &&
                paths[1] === "videos.xml" &&
                urlObj.searchParams.has("channel_id")
            ) {
                return urlObj.searchParams.get("channel_id");
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    getUrl() {
        if (!this.channelId) return null;
        return `https://www.youtube.com/channel/${this.channelId}`;
    }

    isHandledBy() {
        return !!this.channelId;
    }

    getFeeds() {
        if (!this.channelId) return [];
        return [`https://www.youtube.com/feeds/videos.xml?channel_id=${this.channelId}`];
    }

    getLinkVersions() {
       return [this.getUrl()];
    }

    getPreviewHtml() {
       return null;
    }
}


class RedditHandler {
    constructor(url) {
        this.originalUrl = url;
        this.subreddit = this.extractSubreddit(url);
    }

    extractSubreddit(url) {
        try {
            const urlObj = new URL(url);
            const paths = urlObj.pathname.split("/").filter(Boolean); // remove empty segments

            // Match /r/subreddit_name
            if (paths[0] === "r" && paths[1]) {
                return paths[1];
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    getUrl() {
        if (!this.subreddit) return null;
        return `https://www.reddit.com/r/${this.subreddit}/`;
    }

    isHandledBy() {
        return !!this.subreddit;
    }

    getFeeds() {
        if (!this.subreddit) return [];
        return [`https://www.reddit.com/r/${this.subreddit}/.rss`];
    }

    getLinkVersions() {
       return [this.getUrl()];
    }

    getPreviewHtml() {
        return null;
    }
}


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


function GetServiceLinks(link) {
    return [
        {name: "Archive.org", link : getArchiveOrgLink(link)},
        {name: "W3C Validator", link: getW3CValidatorLink(link)},
        {name: "Schema.org", link: getSchemaValidatorLink(link)},
        {name: "Who.is", link: getWhoIsLink(link)},
        {name: "Built.with", link: getBuiltWithLink(link)},
        {name: "Google translate", link: getGoogleTranslateLink(link)},
    ];
}


function getUrlHandler(link) {
    let handler = new YouTubeVideoHandler(link);
    if (handler.isHandledBy())
    {
        return handler;
    }

    handler = new YouTubeChannelHandler(link);
    if (handler.isHandledBy())
    {
        return handler;
    }

    handler = new RedditHandler(link);
    if (handler.isHandledBy())
    {
        return handler;
    }
}


function GetAllServicableLinks(link) {
    let service_links = GetServiceLinks(link);

    const handler = getUrlHandler(link);
    if (handler)
    {
       const feeds = handler.getFeeds();

       const link_versions = handler.getLinkVersions();
       for (const link_version of link_versions) {
           service_links.push({
               name: `Link - ${link_version}`,
               link: link_version
           });
       }

       for (const feed of feeds) {
           const safeFeed = sanitizeLink(feed);
           service_links.push({
               name: `RSS - ${safeFeed}`,
               link: safeFeed
           });
       }
    }

    return service_links;
}


function getYouTubeChannelId(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (urlObj.searchParams.has("channel_id")) {
            return urlObj.searchParams.get("channel_id");
        }

        return null;
    } catch (e) {
        return null;
    }
}


function getYouTubeChannelUrl(url) {
    let id = getYouTubeChannelId(url);
    if (id)
        return `https://www.youtube.com/channel/${id}`;
}



function getChannelUrl(url) {
    let channelid = null;
    if (!url)
        return;

    channelid = getYouTubeChannelUrl(url);
    if (channelid)
        return channelid;
}


function getOdyseeVideoId(url) {
    const url_object = new URL(url);
    const videoId = url_object.pathname.split('/').pop();
    return videoId;
}


