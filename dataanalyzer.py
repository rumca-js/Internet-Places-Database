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

from utils.omnisearch import SingleSymbolEvaluator, EquationEvaluator, OmniSearch
from utils.alchemysearch import AlchemySymbolEvaluator, AlchemyEquationEvaluator, AlchemySearch
from utils.reflected import ReflectedEntryTable
from sqlalchemy import create_engine


class SearchInterface(object):

    def __init__(self, parser=None, engine=None):
        self.parser = parser
        self.start_time = time.time()
        self.engine = engine

        self.files = []

        self.total_entries = 0
        self.good_entries = 0
        self.dead_entries = 0

    def print_entry(self, entry):
        level = self.parser.get_verbosity_level()

        text = ""

        text = "[{:03d}] {}".format(entry.page_rating_votes, entry.link)

        if self.parser.args.title:
            text += " " + entry.title

        print(text)

        if self.parser.args.description:
            description = entry.description
            if description:
                print(description)

        if self.parser.args.tags:
            entry_table = ReflectedEntryTable(self.engine)
            tags = entry_table.get_tags_string(entry.id)
            if tags and tags != "":
                print(tags)

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
            self.engine = create_engine("sqlite:///" + self.parser.args.db)

            row_handler = SearchInterface(self.parser, self.engine)

            searcher = AlchemySearch(self.engine,
                    self.parser.args.search,
                    row_handler = row_handler,
                    args=self.parser.args,
            )
            searcher.search()

    def is_db_scan(self):
        if self.parser.args.db:
            return True

        return False


class Parser(object):

    def parse(self):
        self.parser = argparse.ArgumentParser(description="Data analyzer program")
        self.parser.add_argument("--dir", help="Directory to be scanned")
        self.parser.add_argument("--db", help="DB to be scanned")
        self.parser.add_argument("--search", help="Search, with syntax same as the main program / site.")
        self.parser.add_argument("--order-by", default="page_rating_votes", help="order by column.")
        self.parser.add_argument("--asc", action="store_true", help="order ascending")
        self.parser.add_argument("--desc", action="store_true", help="order descending")
        self.parser.add_argument("--table", default="linkdatamodel", help="Table name")

        self.parser.add_argument("--title", action="store_true", help="displays title")
        self.parser.add_argument("--description", action="store_true", help="displays description")
        self.parser.add_argument("--tags", action="store_true", help="displays tags")

        self.parser.add_argument("-i", "--ignore-case", action="store_true", help="Ignores case")
        self.parser.add_argument("-v", "--verbosity", help="Verbosity level")
        
        self.args = self.parser.parse_args()

        if self.args.dir:
            self.dir = self.args.dir
        else:
            self.dir = None

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

    m = DataAnalyzer(p)
    m.process()


if __name__ == "__main__":
    main()
