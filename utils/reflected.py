from sqlalchemy import MetaData, Table, select


class ReflectedEntryTable(object):
    def __init__(self, engine):
        self.engine = engine

    def get_entries(self):
        destination_metadata = MetaData()
        destination_table = Table("linkdatamodel", destination_metadata, autoload_with=self.engine)

        entries_select = select(destination_table)

        with self.engine.connect() as connection:
            result = connection.execute(entries_select)
            entries = result.fetchall()

            for entry in entries:
                yield entry

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

                tags += row.tag

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
