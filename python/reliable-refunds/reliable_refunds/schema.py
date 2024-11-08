from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Integer,
    MetaData,
    String,
    Table,
    text,
)

metadata = MetaData()

chat_history = Table(
    "chat_history",
    metadata,
    Column("message_id", Integer, primary_key=True, autoincrement=True),
    Column("message_json", String, nullable=False),
    Column(
        "created_at",
        BigInteger,
        nullable=False,
        server_default=text("(EXTRACT(epoch FROM now()) * 1000::numeric)::bigint"),
    ),
)
