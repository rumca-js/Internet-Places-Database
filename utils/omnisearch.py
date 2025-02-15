"""
Cannot have any dependencies to django
"""

try:
    from sympy import sympify
    import sympy
except Exception as E:
    pass


class SingleSymbolEvaluator(object):
    """
    Evaluates single operation, like "Thing = Anything"
    """

    def __init__(self):
        self.not_translated_conditions = {}
        self.translated_conditions = {}
        self.translatable_names = []

    def evaluate_symbol(self, symbol):
        """
        Splits one symbol like "Thing = Anything" into 3 parts

        @returns evaluated symbol value
        """
        condition_data = self.split_symbol(symbol)
        if condition_data:
            return self.evaluate_complex_symbol(symbol, condition_data)
        else:
            return self.evaluate_simple_symbol(symbol)

    def evaluate_complex_symbol(self, symbol, condition_data):
        # print("Condition data {}".format(condition_data))

        if self.is_translatable(condition_data):
            self.enhance_condition_data(condition_data)

            self.translated_conditions[condition_data[0]] = condition_data[2]
            condition_data = self.translate_condition(condition_data)
            return condition_data
        else:
            self.not_translated_conditions[condition_data[0]] = condition_data[2]

    def evaluate_simple_symbol(self, symbol):
        return symbol

    def enhance_condition_data(self, condition_data):
        return condition_data

    def get_operators(self):
        """
        first 2 char operators, then 1 char operators
        """
        return ["===", "==", "?=", "<=", ">=", "~", "=", "<", ">"]

    def cleanup_left_operator_part(self, left_part):
        return left_part.strip()

    def cleanup_right_operator_part(self, right_part):
        right_part = right_part.strip()

        if right_part.startswith('"') and right_part.endswith('"'):
            right_part = right_part[1:-1]
        if right_part.startswith("'") and right_part.endswith("'"):
            right_part = right_part[1:-1]

        return right_part

    def split_symbol(self, symbol):
        for op in self.get_operators():
            wh = symbol.find(op)
            if wh >= 0:
                sp = [symbol[:wh], symbol[wh + len(op) :]]

                left_part = self.cleanup_left_operator_part(sp[0])
                right_part = self.cleanup_right_operator_part(sp[1])

                return [left_part, op, right_part]

    def is_translatable(self, condition):
        """
        If dev does not provide any translate validation - everything will be translated
        """
        if len(self.translatable_names) == 0:
            return True

        for name in self.translatable_names:
            if condition[0] == name:
                return True

        return False

    def translate_condition(self, condition_data):
        """
        Translate user input into system understood syntax.

        Example for django:
         title == 'something'
        Translated:
         title__iexact : 'something'

        by default - not translate
        """
        return condition_data

    def set_translation_mapping(self, names):
        self.translatable_names = names


class EquationTranslator(object):
    def __init__(self, data):
        self.data = data
        self.current_symbol = ord("A") - 1

    def get_operators():
        return ("(", ")", "&", "|", "~", "^", "!")

    def get_whitespaces():
        return (" ", "\t")

    def is_operator(char):
        return char in EquationTranslator.get_operators()

    def is_whitespace(char):
        return char in EquationTranslator.get_whitespaces()

    def process(self):
        result_string = ""
        inside_text = False
        self.conditions = {}
        self.current_condition = ""

        for char in self.data:
            if EquationTranslator.is_operator(char):
                inside_text = False
                result_string += char

                self.add_condition()

            elif inside_text:
                self.current_condition += char
            else:
                self.current_condition += char

                if not EquationTranslator.is_whitespace(char):
                    inside_text = True
                    result_string += self.get_next_symbol()

        self.add_condition()

        return result_string, self.conditions

    def add_condition(self):
        self.current_condition = self.current_condition.strip()
        if self.current_condition != "":
            self.conditions[self.get_current_symbol()] = self.current_condition
            self.current_condition = ""

    def get_current_symbol(self):
        return chr(self.current_symbol)

    def get_next_symbol(self):
        self.current_symbol += 1
        return chr(self.current_symbol)


class EquationEvaluator(object):
    """
    Evaluates equations
    """

    def __init__(self, data, symbol_evaluator):
        self.data = data
        self.symbol_evaluator = symbol_evaluator
        self.known_results = {}
        self.expr = None

    def translate_to_symbol_notation(self, data):
        """
        Sympy operates on symbol notation
        """
        eq = EquationTranslator(data)
        self.eq_string, self.conditions = eq.process()

    def process(self):
        if self.expr is None:
            self.translate_to_symbol_notation(self.data)
            self.expr = sympify(self.eq_string)

        return self.process_internal(self.expr)

    def process_internal(self, expr):
        for arg in expr.args:
            self.process_internal(arg)

        if expr.func == sympy.core.symbol.Symbol:
            symbol = str(expr)

            return self.evaluate_symbol(symbol)
        else:
            function = str(expr.func)
            operation_symbol = str(expr)
            # print("Operation: {}".format(function))

            return self.evaluate_function_and_store(
                operation_symbol, function, expr.args
            )

        # print(f'arg {expr}')
        # print(f'arg.func: {expr.func}')
        # print(f'arg.args: {expr.args}')

    def evaluate_symbol(self, symbol):
        condition_text = self.conditions[symbol]
        # print("Evaluation condition {} {}".format(symbol, condition_text))

        self.known_results[symbol] = self.symbol_evaluator.evaluate_symbol(
            condition_text
        )

        return self.known_results[symbol]

    def evaluate_function_and_store(self, operation_symbol, function, args):
        args0 = str(args[0])
        args0 = self.known_results[args0]

        if len(args) > 1:
            args1 = str(args[1])
            args1 = self.known_results[args1]
        else:
            args1 = None

        val = self.evaluate_function(operation_symbol, function, args0, args1)
        self.known_results[operation_symbol] = val
        return self.known_results[operation_symbol]

    def evaluate_function(self, operation_symbol, function, args0, args1):
        if function == "And":  # & sign
            return args0 & args1
        elif function == "Or":  # | sign
            return args0 | args1
        elif function == "Not":  # ~ sign
            return ~args0
        else:
            raise NotImplementedError("Not implemented function: {}".format(function))

    def reevaluate(self):
        self.known_results = {}


class OmniSearch(object):
    def __init__(self, search_query, symbol_evaluator=None, equation_evaluator=None):
        """
        I assume that either symbol_evaluator is specified, or equation_evaluator
        """
        self.search_query = search_query
        self.query_result = None
        self.errors = []

        if symbol_evaluator:
            self.symbol_evaluator = symbol_evaluator
        else:
            self.symbol_evaluator = SingleSymbolEvaluator()

        if equation_evaluator:
            self.equation_evaluator = equation_evaluator
        else:
            self.equation_evaluator = EquationEvaluator(
                self.search_query, self.symbol_evaluator
            )

    def set_symbol_evaluator(self, symbol_evaluator):
        self.symbol_evaluator = symbol_evaluator
        self.equation_evaluator.symbol_evaluator = symbol_evaluator

    def set_translation_mapping(self, name_mapping):
        """
        We allow only certain symbols to be translated in query.
        We operate on white-list.
        """
        self.symbol_evaluator.set_translation_mapping(name_mapping)
        self.equation_evaluator.symbol_evaluator.set_translation_mapping(name_mapping)

    def get_translated_conditions(self):
        return self.symbol_evaluator.translated_conditions

    def get_not_translated_conditions(self):
        return self.symbol_evaluator.not_translated_conditions

    def is_complex_query(self):
        uses_operator = False

        operators = set()
        for symbol in self.symbol_evaluator.get_operators():
            operators.add(symbol)
        for symbol in EquationTranslator.get_operators():
            operators.add(symbol)

        for symbol in operators:
            if self.search_query.find(symbol) >= 0:
                return True

        return False

    def get_query_result(self):
        """
        API
        """
        if self.query_result is not None:
            return self.query_result

        self.query_result = self.get_combined_query()
        return self.query_result

    def get_combined_query(self):
        if self.search_query:
            query_result = self.equation_evaluator.process()
            return query_result

    def reevaluate(self):
        self.query_result = None
        self.equation_evaluator.reevaluate()
