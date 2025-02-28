from sqlalchemy import and_, or_, not_, func, MetaData, Table, select

from .omnisearch import (
    SingleSymbolEvaluator,
    EquationEvaluator,
    OmniSearch,
)


class AlchemySymbolEvaluator(SingleSymbolEvaluator):
    """
    return 1 if true
    """

    def __init__(self, table, ignore_case = False):
        self.table = table
        self.ignore_case = ignore_case

    def evaluate_complex_symbol(self, symbol, condition_data):
        # TODO make todo check if symbol exists in table?

        if condition_data[1] == "==":
            if self.ignore_case:
                column = self.table.c[condition_data[0]]
                return func.lower(column) == condition_data[2].lower()
            else:
                return self.table.c[condition_data[0]] == condition_data[2]

        if condition_data[1] == "!=":
            if self.ignore_case:
                column = self.table.c[condition_data[0]]
                return func.lower(column) != condition_data[2].lower()
            else:
                return self.table.c[condition_data[0]] != condition_data[2]

        if condition_data[1] == ">":
            return self.table.c[condition_data[0]] > condition_data[2]

        if condition_data[1] == "<":
            return self.table.c[condition_data[0]] < condition_data[2]

        if condition_data[1] == ">=":
            return self.table.c[condition_data[0]] >= condition_data[2]

        if condition_data[1] == "<=":
            return self.table.c[condition_data[0]] <= condition_data[2]

        if condition_data[1] == "=":
            symbol = condition_data[2]
            symbol = symbol.replace("*", "%")

            if self.ignore_case:
                return self.table.c[condition_data[0]].ilike(symbol)
            else:
                return self.table.c[condition_data[0]].like(symbol)

        raise IOError("Unsupported operator")

    def evaluate_simple_symbol(self, symbol):
        """
        TODO we could check by default if entry link == symbol, or sth
        """
        if self.ignore_case:
            symbol = symbol.replace("*", "%")
            return or_(
                self.table.c["link"].ilike(symbol),
                self.table.c["title"].ilike(symbol),
                self.table.c["description"].ilike(symbol),
            )
        else:
            symbol = symbol.replace("*", "%")
            return or_(
                self.table.c["link"].like(symbol),
                self.table.c["title"].like(symbol),
                self.table.c["description"].like(symbol),
            )


class AlchemyEquationEvaluator(EquationEvaluator):
    def evaluate_function(self, operation_symbol, function, args0, args1):
        if function == "And":  # & sign
            return and_(args0, args1)
        elif function == "Or":  # | sign
            return or_(args0, args1)
        elif function == "Not":  # ~ sign
            return not_(args0)
        else:
            raise NotImplementedError("Not implemented function: {}".format(function))


class AlchemyRowHandler(object):
    def handle_row(self, row):
        pass


class AlchemySearch(object):
    def __init__(self, db, search_term, row_handler=None, args=None):
        self.db = db
        self.search_term = search_term
        self.alchemy_row_handler = row_handler

        self.args = args

    def search(self):
        destination_metadata = MetaData()

        if self.args and "table" in self.args:
            destination_table = Table(self.args.table, destination_metadata, autoload_with=self.db)
        else:
            destination_table = Table("linkdatamodel", destination_metadata, autoload_with=self.db)

        ignore_case = False
        if self.args and self.args.ignore_case:
            ignore_case = True

        symbol_evaluator = AlchemySymbolEvaluator(destination_table, ignore_case)
        equation_evaluator = AlchemyEquationEvaluator(self.search_term, symbol_evaluator)

        search = OmniSearch(self.search_term, equation_evaluator=equation_evaluator)
        combined_query_conditions = search.get_combined_query()

        rows = []
        with self.db.connect() as connection:
            order_by_column_name = "id"
            if self.args and self.args.order_by:
                order_by_column_name = self.args.order_by

            order_by_column = getattr(destination_table.c, order_by_column_name, None)

            if order_by_column is None:
                raise AttributeError(f"Invalid order_by column: {self.args.order_by}")

            if self.args:
                # Determine sorting order
                order_by_clause = (
                    order_by_column.asc() if self.args.asc else order_by_column.desc()
                    if self.args.desc else order_by_column.asc()
                )
            else:
                order_by_clause = order_by_column.asc()

            # Use select() for SQLAlchemy Core
            stmt = select(destination_table).where(combined_query_conditions).order_by(order_by_clause)

            # Execute the query
            result = connection.execute(stmt)
            
            # Fetch all results
            rows = result.fetchall()

        for row in rows:
            self.alchemy_row_handler.handle_row(row)
