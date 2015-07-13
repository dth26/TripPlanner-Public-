# initialize database
# to initialize db use 'from __init__ import db'

import sys
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)				# object that will be our database

import model

'''
import imp
models = imp.load_source('modulename', '/var/www/html/Charlotte/Flask/models/models.py')
'''