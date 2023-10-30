# Overview

Database of Internet places, links. Mostly domains.

Acceptable link types:
 - domains
 - repository links. For example to github.
 - content creator user link. Might be youtube channel link.

# Files

Database is distributed as JSON files. It should be easy to export, and import such files. We do not want binary data, binary files. SQL files should be fine, but I am going with JSON files for now.

Fields:
 - page_rating - cumulative link points
 - page_rating_contents - contents link points
 - page_rating_votes - vote link points

# Ranking algorithm

Each page is ranked by several factors.

 - content ranking
 - users votes
 
The result is equal according to calculation
 page ranking = content ranking + users votes

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
 
# Feedback

All feedback is managed by github issues. If you think that link is harmful, please create a ticket. Want to add a link into the database? Please create a ticket.

New tickets should clearly describe intent: \[New\] should be present in ticket title if new link should be added \[Delete\] should be present if a link should be removed.

# Q&A

 - Q: Why page contents is analysed, and is required for a good page ranking?
 - A: We use Internet. It is hard to expect to publish something into Internet and expect it to be private. This is counter intuitive. Secondly most of the pages that do not play along with our society are corporate walled gardens. We have a problem with Spotify not providing any useful data when accessing it data through APIs. We need APIs. We need standards. Not everything needs to be open source, and open for free. Front pages should however always be available for reading, scraping and providing useful data about what it is. No javascript should be required to obtain page contents.
