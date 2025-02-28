from sqlalchemy import MetaData, Table, select, text, inspect


class ReflectedEntryTable(object):
    def __init__(self, engine):
        self.engine = engine

    def get_table(self, table_name):
        destination_metadata = MetaData()
        destination_table = Table(table_name, destination_metadata, autoload_with=self.engine)
        return destination_table

    def truncate_table(self, table_name):
        with self.engine.connect() as connection:
            sql_text = f"DELETE FROM {table_name};"
            connection.execute(text(sql_text))
            connection.commit()

    def get_entries(self):
        destination_metadata = MetaData()
        destination_table = Table("linkdatamodel", destination_metadata, autoload_with=self.engine)

        entries_select = select(destination_table)

        with self.engine.connect() as connection:
            result = connection.execute(entries_select)
            entries = result.fetchall()

            for entry in entries:
                yield entry

    def get_source(self, source_id):
        destination_metadata = MetaData()
        destination_table = Table("sourcedatamodel", destination_metadata, autoload_with=self.engine)

        stmt = select(destination_table).where(destination_table.c.id == source_id)

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()
            for row in rows:
                return row

    def get_tags_string(self, entry_id):
        destination_metadata = MetaData()
        destination_table = Table("usertags", destination_metadata, autoload_with=self.engine)

        stmt = select(destination_table).where(destination_table.c.entry_id == entry_id)

        tags = ""

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()
            for row in rows:
                if tags:
                    tags += ", "

                tags += "#"+row.tag

        return tags

    def get_tags(self, entry_id):
        destination_metadata = MetaData()
        destination_table = Table("usertags", destination_metadata, autoload_with=self.engine)

        stmt = select(destination_table).where(destination_table.c.entry_id == entry_id)

        tags = []

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()
            for row in rows:
                tags.append(row.tag)

        return tags

    def close(self):
        with self.engine.connect() as connection:
            connection.execute(text("VACUUM"))

    def print_summary(self):
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()

        with self.engine.connect() as connection:
            for table in tables:
                row_count = connection.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
                print(f"Table: {table}, Row count: {row_count}")
