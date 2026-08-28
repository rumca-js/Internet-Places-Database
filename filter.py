import argparse

from linkarchivetools.dbfilter import DbFilter, parse
from linkarchivetools.db2json import Db2JSON
from linkarchivetools.dbanalyzer import DbAnalyzer
from linkarchivetools.utils.reflected import ReflectedTable, ReflectedGenericTable
from linkarchivetools.model import DbConnection


"""
def parse():
    parser = argparse.ArgumentParser(description="Data analyzer program")
    parser.add_argument("--db", default='places.db', help="DB to be scanned")
    parser.add_argument("-v", "--verbosity", help="Verbosity level")
    
    args = parser.parse_args()

    return parser, args
"""


def main():
    parser, args = parse()
    if not args.db:
        print("Please specify database")
        return

    db = "internet.db"

    thefilter = DbFilter(db=db)
    if not thefilter.is_valid():
        print("Filter is not valid")
        return

    thefilter.truncate_user_tables() # removes users
    thefilter.truncate_dynamic_data()
    thefilter.truncate_configuration_tables()
    thefilter.obfuscate()
    #thefilter.vacuum()

    thefilter.close()

main()
