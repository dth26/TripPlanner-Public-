#!flask/bin/python


import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'db_file.db')		# path of db file
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')					# store the SQLAlchemy-migrate data files


import sys
sys.path.insert(0, '/var/www/html/Charlotte/main/')

# create the database
# run the script 'python db_create.py' to create database
# sqlalchemy is a Object Relational Mapper that represents a database
# the database of choice is sqlite
# will create database tables using models

from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from __init__ import db
import os.path
db.create_all()
if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
    api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
    api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
else:
    api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))