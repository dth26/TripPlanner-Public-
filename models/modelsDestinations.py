from __init__ import db
from sqlalchemy import *
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import relationship, backref
from flask import request, url_for, render_template, redirect, session, jsonify
from app import app
import sys
import os

basedir = "/home/tripplanner/mysite"


class Destinations(db.Model):
	__tablename__ = 'Destinations'
	__table_args__ = {'extend_existing': True}

	ID = Column(Integer, primary_key = True)
	name = Column(String)
	latitude = Column(DECIMAL)
	longitude = Column(DECIMAL)
	address = Column(String)
	description = Column(String)
	url = Column(String)
	imgPath = Column(String)
	visited = Column(Integer)

	def __init__(self, ID, name, latitude, longitude, address, description, url, imgPath, visited):
		self.ID = ID
		self.name = name
		self.latitude = latitude
		self.longitude = longitude
		self.address = address
		self.description = description
		self.url = url
		self.imgPath = imgPath
		self.visited = visited

db.create_all()




@app.route('/getDestinations', methods=['GET','POST'])
def getDestinations():
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text("select * from Destinations")
    result = connection.execute(query)

    dictionary = [] # json object that will return to front end
    for row in result:
        newRow = {}                                 # new row of data/destination from query
        newRow['name'] = row['name']
        newRow['description'] = row['description']
        newRow['address'] = row['address']
        newRow['ID'] = row['ID']
        newRow['url'] = row['url']
        newRow['visited'] = row['visited']
        newRow['latitude'] = row['latitude']
        newRow['longitude'] = row['longitude']
        dictionary.append(newRow)

    return jsonify(list=dictionary)


@app.route('/newDestination', methods=['GET','POST'])
def addNewDestination():

    description = request.args.get('Description', type=str)
    address = request.args.get('Address', type=str)
    URL = request.args.get('URL', type=str)
    name = request.args.get('Name', type=str)
    latitude = request.args.get('Latitude', type=float)
    longitude = request.args.get('Longitude', type=float)
    #latitude = float(latitudeStr)
    #longitude = float(longitudeStr)

    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('INSERT INTO Destinations(`address`,`description`,`name`,`url`,`longitude`,`latitude`) VALUES(:address, :description, :name, :url, :longitude, :latitude)')
    connection.execute(
                  query,
                  address = address,
                  description = description,
                  name = name,
                  longitude = longitude,
                  latitude = latitude,
                  url = URL)
    connection.close()

    return redirect(url_for('createNew'))








