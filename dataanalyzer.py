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

from linkarchivetools import DbAnalyzer


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
        self.parser.add_argument("-v", "--verbosity", type=int, default=1, help="Verbosity level")
        
        self.args = self.parser.parse_args()

        return True


def main():
    p = Parser()
    if not p.parse():
        print("Could not parse options")
        return

    args = p.args

    analyzer = DbAnalyzer(input_db = p.args.db, args=p.args)
    if p.args.summary:
        analyzer.print_summary()
    else:
        analyzer.search()


if __name__ == "__main__":
    main()
