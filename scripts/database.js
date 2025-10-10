/**
   _____  ____  _      _ _         _                                                    
  / ____|/ __ \| |    (_) |       (_)                                                   
 | (___ | |  | | |     _| |_ ___   _ ___    __ ___      _____  ___  ___  _ __ ___   ___ 
  \___ \| |  | | |    | | __/ _ \ | / __|  / _` \ \ /\ / / _ \/ __|/ _ \| '_ ` _ \ / _ \
  ____) | |__| | |____| | ||  __/ | \__ \ | (_| |\ V  V /  __/\__ \ (_) | | | | | |  __/
 |_____/ \___\_\______|_|\__\___| |_|___/  \__,_| \_/\_/ \___||___/\___/|_| |_| |_|\___|
*/


function getEntriesSelectColumns() {
    columns = "";

    columns += "l.id,";                         // 0
    columns += "l.link,";                       // 1
    columns += "l.title,";                      // 2
    columns += "l.description,";                // 3
    columns += "l.date_published,";             // 4
    columns += "l.thumbnail,";                  // 5
    columns += "l.author,";                     // 6
    columns += "l.album,";                      // 7
    columns += "l.language,";                   // 8
    columns += "l.permanent,";                  // 9
    columns += "l.bookmarked,";                 // 10
    columns += "l.age,";                        // 11
    columns += "l.status_code,";                // 12
    columns += "l.manual_status_code,";         // 13
    columns += "l.page_rating,";                // 14
    columns += "l.page_rating_votes,";          // 15
    columns += "l.page_rating_contents,";       // 16

    columns += "t.tag,";                        // 17

    columns += "socialdata.thumbs_up AS thumbs_up,";                // 18
    columns += "socialdata.thumbs_down AS thumbs_down,";            // 19
    columns += "socialdata.view_count AS view_count,";              // 20
    columns += "socialdata.followers_count AS followers_count,";    // 21
    columns += "socialdata.stars AS stars,";                        // 22
    columns += "socialdata.upvote_ratio AS upvote_ratio,";          // 23
    columns += "socialdata.upvote_diff AS upvote_diff,";            // 24
    columns += "socialdata.upvote_view_ratio AS upvote_view_ratio";  // 25

    return columns;
}


function unpackEntries(res) {
    let results = [];

    if (res.length > 0) {
       const rows = res[0].values;
       
       rows.forEach(row => {
         let tags = [];
         if (row[17] != null) {
             tags = row[17].split(',').filter(tag => tag.trim() !== '');
         }

         const data = {
           id: row[0],
           link: row[1],
           title: row[2],
           description: row[3],
           date_published: row[4],
           thumbnail: row[5],
           author: row[6],
           album: row[7],
           language: row[8],
           permanent: row[9],
           bookmarked: row[10],
           age: row[11],
           status_code: row[12],
           manual_status_code: row[13],
           page_rating: row[14],
           page_rating_votes: row[15],
           page_rating_contents: row[16],
           tags: tags,
           thumbs_up: row[18],
           thumbs_down: row[19],
           view_count: row[20],
           followers_count: row[21],
           stars: row[22],
           upvote_ratio: row[23],
           upvote_diff: row[24],
           upvote_view_ratio: row[25],
         };

         results.push(data);
       });
    }

    return results;
}


`we need to join tags, because when we search for something we want to filter by tags`
function getEntriesSelectFromStmt() {
   return ` FROM linkdatamodel AS l
            LEFT JOIN entrycompactedtags AS t ON l.id = t.entry_id
            LEFT JOIN socialdata AS socialdata ON l.id = socialdata.entry_id`;
}


function selectEntryTags(entry_id) {
   let text = `SELECT tag FROM usertags WHERE entry_id = ${entry_id}`;

   let result = new Set();

   console.log(text);

   const res = db.exec(text);

   if (res.length > 0) {
      const rows = res[0].values;

      rows.forEach(row => {
         result.add(row[0]);
      });
   }

   return Array.from(result); 
}


function selectEntrySocialStmt(entry_id) {
   let text = `SELECT
        id,
        entry_id,
        thumbs_up,
        thumbs_down,
        view_count,
        followers_count,
        stars,
        upvote_ratio,
        upvote_diff,
        upvote_view_ratio
        FROM socialdata WHERE entry_id = ${entry_id}`;

    return text;
}


function selectEntrySocial(entry_id) {
   let text = selectEntrySocialStmt(entry_id);

   let result = new Set();

   console.log(text);

   const res = db.exec(text);

   let social_data = unpackSocialData(res);
   return social_data;
}


function unpackSocialData(res) {
    let results = [];

    if (res.length > 0) {
       const rows = res[0].values;
       
       rows.forEach(row => {
         const data = {
           id: row[0],
           entry_id: row[1],
           thumbs_up: row[2],
           thumbs_down: row[3],
           view_count: row[4],
           followers_count: row[5],
           stars: row[6],
           upvote_ratio: row[7],
           upvote_diff: row[8],
           upvote_view_ratio: row[9],
         };

         results.push(data);
       });
    }

    return results;
}


function getOrderStmt() {
   let sort_method = sort_function;
   let order_method = "ASC";

   if (sort_function.startsWith("-")) {
      sort_method = sort_function.slice(1);
      order_method = "DESC";
   }

   return `ORDER BY ${sort_method} ${order_method}`;
}


let PAGE_SIZE = 100;


function getSelectEntry(entry_id) {
   let text = "SELECT " + getEntriesSelectColumns();
   text += getEntriesSelectFromStmt();
   text += ` WHERE l.id = ${entry_id}`;

   return text;

}


function getEntriesSelectDefault() {
   let text = "SELECT " + getEntriesSelectColumns();
   text += getEntriesSelectFromStmt();

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getEntriesSelectDefaultUserInput(userInput) {
   console.log(userInput);
   let text = "SELECT " + getEntriesSelectColumns();
   text += getEntriesSelectFromStmt();

   text += ` WHERE UPPER(l.title) LIKE UPPER('%${userInput}%')
            OR UPPER(l.link) LIKE UPPER('%${userInput}%')
            OR UPPER(l.description) LIKE UPPER('%${userInput}%')
            OR UPPER(t.tag) LIKE UPPER('%${userInput}%')`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getEntriesSelectCustomSQL(userInput) {

   let text = "SELECT " + getEntriesSelectColumns();
   text += getEntriesSelectFromStmt();

   text += ` WHERE ${userInput}`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();
   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function execQuery(text) {
   console.log(text);
   try {
      const res = db.exec(text);
      object_list_data.entries = unpackEntries(res);
   } catch (error) {
      console.error("Error executing query:", error);
   }
}


async function getQueryTotalRows(text) {
   const fromIndex = text.toUpperCase().indexOf('FROM');
   
   if (fromIndex === -1) {
       return 0;
   }
   
   const offsetIndex = text.toUpperCase().indexOf('OFFSET');
   
   if (offsetIndex !== -1) {
       text = text.slice(0, offsetIndex);
   }

   text = "SELECT COUNT(*) " + text.slice(fromIndex);

   console.log(text);

   try {
      const res = db.exec(text);

      if (res.length > 0) {
         const rows = res[0].values;

         if (rows.length > 0) {
             let size = rows[0][0];
             return size;
         }
      }
   } catch (error) {
      console.error("Error executing query:", error);
   }

   return 0;
}


function getQueryText() {
   let userInput = $("#searchInput").val();

   let text = getEntriesSelectDefault(userInput);

   let entry_id = getQueryParam("entry_id");
   if (entry_id)
   {
      text = getSelectEntry(entry_id);
   }

   if (userInput && userInput != "") {
       if (userInput.indexOf("LIKE") !== -1) {
          text = getEntriesSelectCustomSQL(userInput);
       }
       else {
          text = getEntriesSelectDefaultUserInput(userInput);
       }
   }

   return text;
}


async function createDatabaseData(dataArray) {
  if (db) {
     return false;
  }

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Load the database
    db = new SQL.Database(dataArray);

    return true;

  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:'+ error;
    return false;
  }
}
