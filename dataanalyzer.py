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

from linkarchivetools.dbanalyzer import DbAnalyzer, Parser


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
        for _ in analyzer.search():
            pass


if __name__ == "__main__":
    main()
