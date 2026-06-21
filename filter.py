import argparse

from linkarchivetools.dbfilter import DbFilter
from linkarchivetools.db2json import Db2JSON
from linkarchivetools.dbanalyzer import DbAnalyzer
from linkarchivetools.utils.reflected import ReflectedTable, ReflectedGenericTable
from linkarchivetools.model import DbConnection


def parse():
    parser = argparse.ArgumentParser(description="Data analyzer program")
    parser.add_argument("--db", default='places.db', help="DB to be scanned")
    parser.add_argument("-v", "--verbosity", help="Verbosity level")
    
    args = parser.parse_args()

    return parser, args


def main():
    parser, args = parse()
    if not args.db:
        print("Please specify database")
        return

    output_file = 'internet.db'

    print("Filtering")
    filter = DbFilter(input_db=args.db,output_db=output_file)
    filter.truncate()
    filter.close()
    print("Filtering DONE")

    table = ReflectedTable(engine=connection.engine, connection=connection.connection)
    table.vacuum()
    table.close()

main()
