# Overview

This is a database of Internet places. Mostly domains. Sometimes other things. Think of it as Internet meta database. This repository contains link metadata: title, description, publish date, etc.

<div align="center">
  <img alt="Project Logo" src="images/its_easy_internet_on_internet.png">
</div>

# Acceptable link types

 - domains
 - repository links. For example [https://github.com/rumca-js/Internet-Places-Database](https://github.com/rumca-js/Internet-Places-Database)
 - user spaces. Might be youtube channel link: [Linus Tech Tips YouTube Channel](https://www.youtube.com/channel/UCXuqSBlHAE6Xw-yeJA0Tunw). Might be X/Twitter user account.

# Sources of data

Obtained by the [Django-link-archive](https://github.com/rumca-js/Django-link-archive) web crawler.

Sources:

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

# Tags

Each entry can be tagged. Most notable examples of tags

 - open source - if entry is "open source" related
 - personal - if it seems to be a personal website
 - self-host - software that can be self-hosted
 - company - if entry exists just to provide information about company
 - university, museum, etc - if entry provides details about a univeristy, museum, etc.
 - disinformation / misinformation - self explanatory
 - news - if it is "news" content farm. Might be also "game news", "tech news", etc.
 - propaganda
 
# Demo database

Might not be working. Used for development: [https://renegat0x0.ddns.net/apps/places/](https://renegat0x0.ddns.net/apps/places/)
