

function escapeHtml(unsafe)
{
  if (unsafe == null)
      return "";

  unsafe = String(unsafe);

  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}


class UrlLocation {
  constructor(urlString) {
    this.raw = urlString;
    try {
      this.url = new URL(urlString);
    } catch (e) {
      console.log(e);
      this.url = null;
    }
  }

  isWebLink() {
        const url = this.raw;
        if (url == null)
        {
            return false;
        }

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("smb://") ||
            url.startsWith("ftp://") ||
            url.startsWith("//") ||
            url.startsWith("\\\\")
        ) {
            // https://mailto is not a good link
            if (!url.includes(".")) {
                return false;
            }

            // no funny chars
            const domainOnly = this.getDomain();
            if (!domainOnly) {
                return false;
            }
            if (domainOnly.includes("&")) {
                return false;
            }
            if (domainOnly.includes("?")) {
                return false;
            }

            const parts = domainOnly.split(".");
            if (parts[0].trim() === "") {
                return false;
            }

            return true;
        }

        return false;
  }

  getProtocolless() {
    if (this.url != null) {
       return sanitizeLink(this.url.href.replace(`${this.url.protocol}//`, ''));
    }
  }

  getDomain() {
    const protocolless = this.getProtocolless();
    if (protocolless == null) {
      return;
    }

    const firstSlashIndex = protocolless.indexOf('/');
    if (firstSlashIndex === -1) {
      return protocolless;
    }
    return protocolless.substring(0, firstSlashIndex);
  }
}


function createLinks(inputText) {
    const urlRegex = /(?<!<a[^>]*>)(https:\/\/[a-zA-Z0-9-_\.\/]+)(?!<\/a>)/g;
    const urlRegex2 = /(?<!<a[^>]*>)(http:\/\/[a-zA-Z0-9-_\.\/]+)(?!<\/a>)/g;

    inputText = inputText.replace(urlRegex, (match, url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    inputText = inputText.replace(urlRegex2, (match, url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });

    return inputText;
}

class ContentDisplay {
  constructor(text) {
    this.text = text;
  }

  htmlify() {
    this.text = this.noattrs();
    this.text = this.linkify();
    return this.text;
  }

  nohtml() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.text, "text/html");
  
    const elements = doc.querySelectorAll("p, div, table, a");
  
    elements.forEach(el => {
      // Replace the <p> or <div> with its children (unwrap it)
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });
  
    return doc.body.innerHTML;
  }

  noattrs() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.text, "text/html");

    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === "a") {
          const href = node.getAttribute("href");
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
          if (href) node.setAttribute("href", href);
        } else if (node.tagName.toLowerCase() === "img") {
          const src = node.getAttribute("src");
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
          if (src) node.setAttribute("src", src);
        } else {
          node.getAttributeNames().forEach(attr => node.removeAttribute(attr));
        }
      }
      for (let child of node.childNodes) {
        walk(child);
      }
    };

    walk(doc.body);
    return doc.body.innerHTML;
  }

  linkify() {
    this.text = this.linkify_protocol("https://");
    this.text = this.linkify_protocol("http://");
    this.text = this.linkify_mail();
    return this.text;
  }

  removeImgs(link) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.text, "text/html");

    const imgs = doc.querySelectorAll(`img[src="${link}"]`);
    imgs.forEach(img => img.remove());

    this.text = doc.body.innerHTML;
    return this.text;
  }

  linkify_protocol(protocol = "https://") {
    let text = this.text;

    if (!text.includes(protocol)) {
        return text;
    }

    let result = "";
    let i = 0;

    while (i < text.length) {
        const pattern = new RegExp(`${protocol}\\S+(?![\\w.])`);
        const match = text.slice(i).match(pattern);

        if (match && match.index === 0) {
            const url = match[0];
            const precedingChars = text.slice(Math.max(0, i - 10), i);

            if (!precedingChars.includes('<a href="') && !precedingChars.includes("<img")) {
                result += `<a href="${url}">${url}</a>`;
            } else {
                result += url;
            }

            i += url.length;
        } else {
            result += text[i];
            i += 1;
        }
    }

    return result;
  }

  linkify_mail() {
    const pattern = /mailto:([\w.-]+@[\w.-]+\.\w+)/g;
    this.text = this.text.replace(pattern, '<a href="mailto:$1">$1</a>');
    return this.text;
  }
}


class ContentLinkParser {
    constructor(url, contents) {
        this.url = url || null;
        this.contents = contents;
    }

    getContents() {
        return this.contents;
    }

    getLinks() {
        let links = new Set();

        this.getLinksHttps("https").forEach(l => links.add(l));
        this.getLinksHttpsEncoded("https").forEach(l => links.add(l));
        this.getLinksHttps("http").forEach(l => links.add(l));
        this.getLinksHttpsEncoded("http").forEach(l => links.add(l));
        this.getLinksHref().forEach(l => links.add(l));

        //console.log("Obtained");
        //this.debugLinks(links);

        // Cleanup similar to Python code
        let cleaned = new Set();

        for (let item of links) {
            if (!item) continue;

            const cutTokens = ['"', '<', '>', '&quot;', '&gt;', '&lt;'];
            for (const token of cutTokens) {
                const idx = item.indexOf(token);
                if (idx !== -1) {
                    item = item.slice(0, idx);
                }
            }

            item = item.trim();
            if (item) {
                cleaned.add(item);
            }
        }

        //console.log("Cleaned");
        //this.debugLinks(cleaned);

        // Remove junk values
        const blacklist = new Set([
            null, "", "http", "https", "http://", "https://"
        ]);

        let result = new Set();
        for (let link of cleaned) {
            let link_location = new UrlLocation(link);
            let is_web_link = link_location.isWebLink();

            if (!blacklist.has(link) && is_web_link) {
                result.add(link);
            }
        }

        return result;
    }

    debugLinks(links) {
        for (let item of links) {
            console.log(item);
        }
    }

    getLinksHttps(protocol = "https") {
        const cont = String(this.getContents());
        const pattern = new RegExp(
            `(${protocol}:\\/\\/[a-zA-Z0-9./\\-_?&=#;:@]+)`,
            "g"
        );

        const matches = cont.match(pattern) || [];
        return new Set(matches.map(l => l.replace(/\.$/, "")));
    }

    getLinksHttpsEncoded(protocol = "https") {
        const cont = String(this.getContents());
        const pattern = new RegExp(
            `(${protocol}:&#x2F;&#x2F;[a-zA-Z0-9./\\-_?&=#;:@]+)`,
            "g"
        );

        const matches = cont.match(pattern) || [];
        return matches
            .map(l => l.replace(/\.$/, ""))
            .map(decodeEncodedUrl);
    }

    getLinksHref() {
        const cont = String(this.getContents());
        const pattern = /href\s*=\s*["']([^"']+)["']/gi;

        let result = new Set();
        let match;
        while ((match = pattern.exec(cont)) !== null) {
            result.add(match[1]);
        }
        return result;
    }
}


function decodeEncodedUrl(url) {
    if (!url) return url;

    const textarea = document.createElement("textarea");
    textarea.innerHTML = url;
    return textarea.value;
}


function fixStupidGoogleRedirects(input_url) {
    if (!input_url) {
        return null;
    }

    if (input_url.includes("www.google.com/url")) {
        const url = new URL(input_url);
        let realURL = url.searchParams.get('q');
        if (realURL) {
            return realURL;
        }
        realURL = url.searchParams.get('url');
        if (realURL) {
            return realURL;
        }
        return input_url;
    }

    return input_url;
}


function fixStupidYoutubeRedirects(input_url) {
    if (!input_url) {
        return null;
    }

    if (input_url.includes("www.youtube.com/redirect")) {
        const url = new URL(input_url);
        let redirectURL = url.searchParams.get('q');

        if (redirectURL) {
            return decodeURIComponent(redirectURL);
        }
        else {
            return input_url;
        }
    }

    return input_url;
}


function fixStupidMicrosoftSafeLinks(input_url) {
    if (!input_url) {
        return null;
    }

    try {
        const parsedUrl = new URL(input_url);

        if (parsedUrl.hostname.endsWith("safelinks.protection.outlook.com")) {
            const originalUrl = parsedUrl.searchParams.get("url");

            if (originalUrl) {
                return decodeURIComponent(originalUrl);
            }
        }
    } catch (e) {
    }

    return input_url;
}


function sanitizeLinkGeneral(link) {
   link = link.trimStart();

   // link can be inserted by hand, so someone might enter / at the end
   //if (link.endsWith("/")) {
   //   link = link.slice(0, -1);
   //}
   if (link.endsWith(" ")) {
      link = link.slice(0, -1);
   }

   return link;
}


function sanitizeLink(link) {
   link = sanitizeLinkGeneral(link);
   link = fixStupidGoogleRedirects(link);
   link = fixStupidYoutubeRedirects(link);
   link = fixStupidMicrosoftSafeLinks(link);
   link = sanitizeLinkGeneral(link);

   return link;
}


function isSocialMediaSupported(entry) {
    let page = new UrlLocation(entry.link)
    let domain = page.getDomain()
    if (!domain) {
        return false;
    }

    if (domain.includes("youtube.com")) {
        return true;
    }
    if (domain.includes("github.com")) {
        return true;
    }
    if (domain.includes("reddit.com")) {
        return true;
    }
    if (domain.includes("news.ycombinator.com")) {
        return true;
    }

    return false
}


/**
 * Handlers
 */

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


class OdyseeVideoHandler {
    // Example: https://odysee.com/@samtime:1/apple-reacts-to-leaked-windows-12:1?test
    constructor(url) {
        this.originalUrl = url;
        this.videoId = this.extractVideoId(url);
        this.channelId = this.extractChannelId(url);
    }

    extractVideoId(url) {
        try {
            const urlObj = new URL(url);
            const paths = urlObj.pathname.split("/").filter(Boolean);

            const last = paths[paths.length - 1];
            if (last && last.includes(":")) {
                return last;
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    extractChannelId(url) {
        try {
            const urlObj = new URL(url);
            const paths = urlObj.pathname.split("/").filter(Boolean);

            // Look for a path segment starting with @ (e.g., "@samtime:1")
            for (const part of paths) {
                if (part.startsWith("@") && part.includes(":")) {
                    return part;
                }
            }

            return null;
        } catch (e) {
            return null;
        }
    }

    getUrl() {
        if (!this.channelId || !this.videoId) return null;
        return `https://odysee.com/${this.channelId}/${this.videoId}`;
    }

    isHandledBy() {
        return !!this.videoId;
    }

    getFeeds() {
        if (!this.channelId) return [];
        return [`https://odysee.com/$/rss/${this.channelId}`];
    }

    getLinkVersions() {
        return [this.getUrl()];
    }

    getPreviewHtml() {
        if (!this.channelId || !this.videoId) return null;

        const embedUrl = `https://odysee.com/${this.channelId}/${this.videoId}`;

        return `
            <div class="odysee_player_container mb-4">
                <iframe 
                    src="${embedUrl}" 
                    frameborder="0" 
                    allowfullscreen 
                    class="odysee_player_frame w-100" 
                    style="aspect-ratio: 16 / 9;"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        `;
    }

    getEmbedUrl() {
        if (!this.videoId) return null;

        return `https://odysee.com/$/embed/${this.videoId}`;
    }
}


class OdyseeChannelHandler {
    // https://odysee.com/@samtime:1?test
    // https://odysee.com/$/rss/@samtime:1
    constructor(url) {
        this.originalUrl = url;
        this.channelId = this.extractChannelId(url);
    }

    extractChannelId(url) {
        try {
            const urlObj = new URL(url);
            const paths = urlObj.pathname.split("/").filter(Boolean);
    
            // Odysee channel formats to support:
            // - https://odysee.com/@channelName:channelId
            // - https://odysee.com/$/rss/@channelName:channelId
    
            for (const part of paths) {
                if (part.startsWith("@")) {
                    return part; // this is the channel ID
                }
            }
    
            return null;
        } catch (e) {
            return null;
        }
    }

    getUrl() {
        if (!this.channelId) return null;
        return `https://odysee.com/${this.channelId}`;
    }

    isHandledBy() {
        return !!this.channelId;
    }

    getFeeds() {
        if (!this.channelId) return [];
        return [`https://odysee.com/$/rss/${this.channelId}`];
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

    handler = new OdyseeVideoHandler(link);
    if (handler.isHandledBy())
    {
        return handler;
    }

    handler = new OdyseeChannelHandler(link);
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


function getChannelUrl(url) {
    let handler = new YouTubeChannelHandler(url);
    if (handler.isHandledBy())
    {
        return handler.getUrl()
    }
    handler = new OdyseeChannelHandler(url);
    if (handler.isHandledBy())
    {
        return handler.getUrl()
    }
    handler = new RedditHandler(url);
    if (handler.isHandledBy())
    {
        return handler.getUrl()
    }
}
