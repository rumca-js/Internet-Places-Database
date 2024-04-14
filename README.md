# Overview

This is a database of Internet places. Mostly domains. Sometimes other things. Think of it as Internet meta database. This repository contains link metadata: title, description, publish date, etc.

![](https://github.com/rumca-js/Internet-Places-Database/blob/main/images/its_easy_internet_on_internet.png?raw=true)

Acceptable link types:
 - domains
 - repository links. For example [https://github.com/rumca-js/Internet-Places-Database](https://github.com/rumca-js/Internet-Places-Database)
 - user spaces. Might be youtube channel link: [Linus Tech Tips YouTube Channel](https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw). Might be X/Twitter user account.

# Sources of data

 - [https://nownownow.com/](https://nownownow.com/)
 - [https://searchmysite.net/](https://searchmysite.net/)
 - [https://downloads.marginalia.nu/](https://downloads.marginalia.nu/)
 - hacker front page entries
 - some reddit channels

# Files

The database is distributed as a set of JSON files. We do not want to store binary data, binary files. SQL files should be fine, but I am going with JSON files for now.

Each link contains a set of attributes, like:
 - title
 - description
 - page rating
 - date of creation
 - etc.

# Ranking algorithm

Each link, page is ranked by several factors.

 - content ranking
 - users votes
 
The result is equal according to calculation
 page ranking = content ranking + users votes

Note: Page rating should not be based on 'time'. Older pages are not 'worse' because x amount has passed. Older pages need to be verified however, and content votes should be updated.

Each link has fields:
 - page_rating - cumulative link points
 - page_rating_contents - contents link points
 - page_rating_votes - vote link points

# Content ranking

Each page is automatically ranked by it's contents. There are several factors that are included into the ranking:
 - meta title
 - meta description (earns 5 points)
 - og:title
 - og:description (earns 5 points)
 - og:image (earns 5 points)
 - presence of RSS feed link

 Title point breakdown:
 - good title earns 10 points
 - if title is longer than 1000 characters 5 points
 - if title is one word 5 points
 - if title has less than 4 chars 2 points

Status code breakdown:
 - code 200 earns 10 points
 - code between 200 and 300 earns 5 points

# Votes ranking

Database is managed by RSS link database, and user votes. Avarage of votes is calculated for each link.

# Tags

Each entry can be tagged. Most notable examples of tags

 - open source - if entry is "open source" related
 - company - if entry exists just to provide information about company
 - personal - if it seems to be a personal website
 - university, museum, etc - if entry provides details about a univeristy, museum, etc.
 - disinformation / misinformation - self explanatory
 - news - if it is "news" content farm. Might be also "game news", "tech news", etc.
 - propaganda
 
# Feedback

All feedback is managed by github issues. If you think that link is harmful, please create a ticket. Want to add a link into the database? Please create a ticket.

New tickets should clearly describe intent: \[New\] should be present in ticket title if new link should be added \[Delete\] should be present if a link should be removed.

# Q&A

 - Q: Why page contents is analysed, and is required for a good page ranking?
 - A: We use Internet. It is hard to expect to publish something into Internet and expect it to be private. This is counter intuitive. Secondly most of the pages that do not play along with our society are corporate walled gardens. We have a problem with Spotify not providing any useful data when accessing it data through APIs. We need APIs. We need standards. Not everything needs to be open source, and open for free. Front pages should however always be available for reading, scraping and providing useful data about what it is. No javascript should be required to obtain page contents.

# Demo database

Might not be working. Used for development: [https://renegat0x0.ddns.net/apps/places/](https://renegat0x0.ddns.net/apps/places/)
