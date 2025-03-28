/**
   _____  ____  _      _ _         _                                                    
  / ____|/ __ \| |    (_) |       (_)                                                   
 | (___ | |  | | |     _| |_ ___   _ ___    __ ___      _____  ___  ___  _ __ ___   ___ 
  \___ \| |  | | |    | | __/ _ \ | / __|  / _` \ \ /\ / / _ \/ __|/ _ \| '_ ` _ \ / _ \
  ____) | |__| | |____| | ||  __/ | \__ \ | (_| |\ V  V /  __/\__ \ (_) | | | | | |  __/
 |_____/ \___\_\______|_|\__\___| |_|___/  \__,_| \_/\_/ \___||___/\___/|_| |_| |_|\___|
*/

function getSelectColumns() {
    return "l.id, l.link, l.title, l.description, l.date_published, l.thumbnail, l.author, l.album, l.language, l.permanent, l.bookmarked, l.age, l.status_code, l.manual_status_code, l.page_rating, l.page_rating_votes, l.page_rating_contents, e.tag";
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


function unpackQueryResults(res) {
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
   let text = "SELECT " + getSelectColumns();
   text = text + ` FROM linkdatamodel AS l
                   LEFT JOIN entrycompactedtags AS e ON l.id = e.entry_id`;
   text = text + ` WHERE l.id = ${entry_id}`;

   return text;

}


function getSelectDefault() {
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel AS l
                   LEFT JOIN entrycompactedtags AS e ON l.id = e.entry_id`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectDefaultUserInput(userInput) {
   console.log(userInput);
   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel AS l
                   LEFT JOIN entrycompactedtags AS e ON l.id = e.entry_id
                   WHERE UPPER(l.title) LIKE UPPER('%${userInput}%')
                   OR UPPER(l.link) LIKE UPPER('%${userInput}%')
                   OR UPPER(l.description) LIKE UPPER('%${userInput}%')
                   OR UPPER(e.tag) LIKE UPPER('%${userInput}%')`;

   let page = getQueryParam("page") || 1;
   const offset = (page - 1) * PAGE_SIZE;

   let order_by = getOrderStmt();

   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
   return text;
}


function getSelectCustomSQL(userInput) {

   let text = "SELECT " + getSelectColumns();

   text = text + ` FROM linkdatamodel AS l
                   LEFT JOIN entrycompactedtags AS e ON l.id = e.entry_id
                   WHERE ${userInput}`;

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
      object_list_data.entries = unpackQueryResults(res);
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


function getQueryTagsText() {
    /**
     * Known feature of SQLite. It does not provide DISTINCT keyword
     * meaning this can result duplicated records.
     */
    let text = `
   SELECT l.*
   FROM linkdatamodel l
   JOIN usertags u ON l.id = u.entry_id
   WHERE u.tag LIKE '%video game%'`

   let order_by = getOrderStmt();
   let page_size_query = PAGE_SIZE;

   text = text + ` ${order_by} LIMIT ${page_size_query} OFFSET ${offset}`;
}


function getQueryText() {
   let userInput = $("#searchInput").val();

   let text = getSelectDefault(userInput);

   let entry_id = getQueryParam("entry_id");
   if (entry_id)
   {
      text = getSelectEntry(entry_id);
   }

   if (userInput && userInput != "") {
       if (userInput.indexOf("LIKE") !== -1) {
          text = getSelectCustomSQL(userInput);
       }
       else {
          text = getSelectDefaultUserInput(userInput);
       }
   }

   return text;
}


async function createDatabaseData(dataArray) {
  if (db) {
     return false;
  }

  console.log("createDatabaseData");

  try {
    const config = {
      locateFile: filename => `https://cdn.jsdelivr.net/npm/sql.js@1.6.0/dist/${filename}`
    };

    // Initialize SQL.js with the correct .wasm path
    const SQL = await initSqlJs(config);

    // Load the database
    db = new SQL.Database(dataArray);
    console.log("createDatabaseData DONE");

    return true;

  } catch (error) {
    console.error('Error loading SQLite database or executing query:', error);
    progressBarElement.textContent = 'Error loading SQLite database or executing query:'+ error;
    return false;
  }
}
