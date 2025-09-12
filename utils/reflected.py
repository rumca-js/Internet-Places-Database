from sqlalchemy import MetaData, Table, select, text, inspect
from sqlalchemy import Index


class ReflectedTable(object):
    def __init__(self, engine):
        self.engine = engine

    def get_table(self, table_name):
        destination_metadata = MetaData()
        destination_table = Table(
            table_name, destination_metadata, autoload_with=self.engine
        )
        return destination_table

    def truncate_table(self, table_name):
        with self.engine.connect() as connection:
            sql_text = f"DELETE FROM {table_name};"
            connection.execute(text(sql_text))
            connection.commit()

    def create_index(self, table, column_name):
        index_name = f"idx_{table.name}_{column_name}"
        index = Index(index_name, getattr(table.c, column_name))

        index.create(bind=self.engine)

    def close(self):
        with self.engine.connect() as connection:
            connection.execute(text("VACUUM"))

    def print_summary(self, print_columns=False):
        inspector = inspect(self.engine)
        tables = inspector.get_table_names()

        with self.engine.connect() as connection:
            for table in tables:
                row_count = connection.execute(
                    text(f"SELECT COUNT(*) FROM {table}")
                ).scalar()
                print(f"Table: {table}, Row count: {row_count}")

                if print_columns:
                    columns = inspector.get_columns(table)
                    column_names = [column["name"] for column in columns]
                    print(f"Columns in {table}: {', '.join(column_names)}")


class ReflectedEntryTable(ReflectedTable):
    def get_entries(self):
        destination_table = self.get_table("linkdatamodel")

        entries_select = select(destination_table)

        with self.engine.connect() as connection:
            result = connection.execute(entries_select)
            entries = result.fetchall()

            for entry in entries:
                yield entry


class ReflectedUserTags(ReflectedTable):
    def get_tags_string(self, entry_id):
        destination_table = self.get_table("usertags")

        stmt = select(destination_table).where(destination_table.c.entry_id == entry_id)

        tags = ""

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()
            for row in rows:
                if tags:
                    tags += ", "

                tags += "#" + row.tag

        return tags

    def get_tags(self, entry_id):
        destination_table = self.get_table("usertags")

        stmt = select(destination_table).where(destination_table.c.entry_id == entry_id)

        tags = []

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            rows = result.fetchall()
            for row in rows:
                tags.append(row.tag)

        return tags


class ReflectedSourceTable(ReflectedTable):
    def get_source(self, source_id):
        destination_table = self.get_table("sourcedatamodel")

        stmt = select(destination_table).where(destination_table.c.id == source_id)

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            return result.first()


class ReflectedSocialData(ReflectedTable):
    def get(self, entry_id):
        destination_table = self.get_table("socialdata")

        stmt = select(destination_table).where(destination_table.c.entry_id == entry_id)

        with self.engine.connect() as connection:
            result = connection.execute(stmt)
            return result.first()
