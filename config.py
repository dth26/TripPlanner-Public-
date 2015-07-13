# using sqlite which stores database in a single file

import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db_file.db')		# path of db file
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')					# store the SQLAlchemy-migrate data files

