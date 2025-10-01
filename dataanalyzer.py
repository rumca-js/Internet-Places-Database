"""
Provides information about archive

Examples:
 - What was said about Musk
  $ --search "title=*Musk*"
 - What was said about Musk (title, link, description, etc)
  $ --search "Musk"

TODO
 - Output formats? (md)?
 - Maybe it could produce a chart?

"""
import argparse
import time
import os
import json
from sqlalchemy import create_engine

from utils.omnisearch import SingleSymbolEvaluator, EquationEvaluator, OmniSearch
from utils.alchemysearch import AlchemySymbolEvaluator, AlchemyEquationEvaluator, AlchemySearch
from utils.reflected import  (
   ReflectedEntryTable,
   ReflectedUserTags,
   ReflectedSocialData,
)


def print_summary(db, print_columns=False):
    if not os.path.isfile(db):
        print("File does not exist:{}".format(db))
        return

    engine = create_engine("sqlite:///" + db)
    with engine.connect() as connection:
        r = ReflectedEntryTable(engine, connection)
        r.print_summary(print_columns)


class SearchInterface(object):

    def __init__(self, parser=None, engine=None, connection=None):
        self.parser = parser
        self.start_time = time.time()
        self.engine = engine
        self.connection = connection

        self.files = []

        self.total_entries = 0
        self.good_entries = 0
        self.dead_entries = 0

    def print_entry(self, entry):
        level = self.parser.get_verbosity_level()

        text = ""

        if self.parser.args.description:
            print("---------------------")

        text = "[{:03d}] {}".format(entry.page_rating_votes, entry.link)

        if self.parser.args.title:
            if entry.title:
                text += " " + entry.title

        if self.parser.args.source:
            source_id = entry.source
            if source_id:
                r = ReflectedEntryTable(self.engine, self.connection)
                source = r.get_source(source_id)
                text += " [{}]".format(source.title)

        print(text)

        if self.parser.args.date_published:
            date_published = entry.date_published
            if date_published:
                print(date_published)

        if self.parser.args.description:
            description = entry.description
            if description:
                print(description)

        if self.parser.args.tags:
            tags_table = ReflectedUserTags(self.engine, self.connection)
            tags = tags_table.get_tags_string(entry.id)
            if tags and tags != "":
                self.print_tags(tags)

        if self.parser.args.social:
            social_table = ReflectedSocialData(self.engine, self.connection)
            social = social_table.get(entry.id)
            if social is not None:
                self.print_social(social)

        if self.parser.args.status:
            print(entry.status_code)

    def print_tags(self, tags):
        print(tags)

    def print_social(self, social):
        if social.view_count is not None and social.thumbs_up is not None and social.thumbs_down is not None:
            print(f"V:{social.view_count} TU:{social.thumbs_up} TD:{social.thumbs_down}")
        else:
            if social.view_count:
                print(f"F:{social.view_count}")

            if social.thumbs_up:
                print(f"F:{social.thumbs_up}")

            if social.thumbs_down:
                print(f"F:{social.thumbs_down}")

            if social.upvote_diff:
                print(f"S:{social.upvote_diff}")

            if social.upvote_ratio:
                print(f"S:{social.upvote_ratio}")

            if social.followers_count:
                print(f"F:{social.followers_count}")

            if social.stars:
                print(f"S:{social.stars}")

    def get_time_diff(self):
        return time.time() - self.start_time

    def print_time_diff(self):
        elapsed_time_seconds = time.time() - self.start_time
        elapsed_minutes = int(elapsed_time_seconds // 60)
        elapsed_seconds = int(elapsed_time_seconds % 60)
        print(f"Time: {elapsed_minutes}:{elapsed_seconds}")

    def handle_row(self, row):
        """
        Row is to be expected a 'dict', eg. row["link"]
        """
        link = row.link

        level = self.parser.get_verbosity_level()

        self.print_entry(row)

        self.total_entries += 1

    def summary(self):
        if self.parser.args.summary:
            if self.parser.args.verify:
                print("total:{} good:{} dead:{}".format(self.total_entries, self.good_entries, self.dead_entries))
            else:
                print("total:{}".format(self.total_entries))


class DataAnalyzer(object):
    def __init__(self, parser):
        self.parser = parser
        self.result = None
        self.engine = None

    def process(self):
        if self.is_db_scan():
            file = self.parser.args.db
            if not os.path.isfile(file):
                print("File does not exist:{}".format(file))
                return

            print("Creating engine")
            self.engine = create_engine("sqlite:///" + self.parser.args.db)
            print("Creating engine DONE")

            with self.engine.connect() as connection:
                self.connection = connection

                row_handler = SearchInterface(self.parser, self.engine, self.connection)

                print("Starting alchemy")
                searcher = AlchemySearch(self.engine,
                        self.parser.args.search,
                        row_handler = row_handler,
                        args=self.parser.args,
                        connection=self.connection,
                )
                print("Starting alchemy DONE")

                print("Searching...")
                searcher.search()

    def is_db_scan(self):
        if self.parser.args.db:
            return True

        return False


class Parser(object):

    def parse(self):
        self.parser = argparse.ArgumentParser(description="Data analyzer program")
        self.parser.add_argument("--db", help="DB to be scanned")

        self.parser.add_argument("--search", help="Search, with syntax same as the main program / site.")
        self.parser.add_argument("--order-by", default="page_rating_votes", help="order by column.")
        self.parser.add_argument("--asc", action="store_true", help="order ascending")
        self.parser.add_argument("--desc", action="store_true", help="order descending")
        self.parser.add_argument("--table", default="linkdatamodel", help="Table name")

        self.parser.add_argument("--title", action="store_true", help="displays title")
        self.parser.add_argument("--description", action="store_true", help="displays description")
        self.parser.add_argument("--status", action="store_true", help="displays status")
        self.parser.add_argument("--tags", action="store_true", help="displays tags")
        self.parser.add_argument("--social", action="store_true", help="displays social data")
        self.parser.add_argument("--date-published", action="store_true", help="displays date-published")
        self.parser.add_argument("--source", action="store_true", help="displays source")

        self.parser.add_argument("--summary", action="store_true", help="displays summary of tables")
        self.parser.add_argument("--columns", action="store_true", help="displays summary of tables column nmaes")

        self.parser.add_argument("-i", "--ignore-case", action="store_true", help="Ignores case")
        self.parser.add_argument("-v", "--verbosity", help="Verbosity level")
        
        self.args = self.parser.parse_args()

        return True

    def get_verbosity_level(self):
        level = 1
        if self.args.verbosity:
            try:
                level = int(self.args.verbosity)
            except Exception as E:
                print(str(E))

        return level


def main():
    p = Parser()
    if not p.parse():
        print("Could not parse options")
        return

    if p.args.summary:
        print_summary(p.args.db, p.args.columns)
    else:
        m = DataAnalyzer(p)
        m.process()


if __name__ == "__main__":
    main()
