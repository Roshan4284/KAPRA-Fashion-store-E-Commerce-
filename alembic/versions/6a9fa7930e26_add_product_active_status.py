"""add product active status

Revision ID: 6a9fa7930e26
Revises: dbed8ddfdf60
Create Date: 2026-08-14 23:05:20.297723
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6a9fa7930e26"

down_revision: Union[str, Sequence[str], None] = "dbed8ddfdf60"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "products",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.alter_column(
        "products",
        "is_active",
        server_default=None
    )


def downgrade() -> None:

    op.drop_column(
        "products",
        "is_active"
    )