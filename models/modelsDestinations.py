from __init__ import db
from sqlalchemy import *
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import relationship, backref
from flask import request, url_for, render_template, redirect, session, jsonify
from app import app
import sys
import os
import urllib2
import urllib
import oauth2
import json

basedir = "/home/tripplanner/mysite"


YELP_HOST = 'api.yelp.com'
YELP_PATH = '/v2/search/'


# OAuth credential
CONSUMER_KEY = 's2ndfBQeDdPb3yz6JQpeRA'
CONSUMER_SECRET = 'XCiSSKmUcjwzCF2bTeqWdAWWEDw'
TOKEN = 'ZpNcuOUbNo48E9XFqL3eWZIF6i9IG0Uo'
TOKEN_SECRET = 'wtCI1TK7RBET0GTN2pL5Xgb-4Jc'


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
	yelp_url = Column(String)
	imgPath = Column(String)
	visited = Column(Integer)
	category = Column(String)

	def __init__(self, ID, name, latitude, longitude, address, description, url, yelp_url, imgPath, visited, category):
		self.ID = ID
		self.name = name
		self.latitude = latitude
		self.longitude = longitude
		self.address = address
		self.description = description
		self.url = url
		self.imgPath = imgPath
		self.visited = visited
		self.yelp_url = yelp_url
		self.category = category

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
        newRow['yelp_url'] = row['yelp_url']
        newRow['category'] = row['category']
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
    category = request.args.get('category', type=str)
    yelp_url = None

    if 'yelp.com' in URL:
        yelp_url = URL
    else:
        json = getYelpInfo(name, address)
        try:
            yelp_url = json['businesses'][0]['mobile_url']
        except:
            yelp_url = 'no result!'


    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('INSERT INTO Destinations(`address`,`description`,`name`,`url`,`longitude`,`latitude`, `yelp_url`, `category`) VALUES(:address, :description, :name, :url, :longitude, :latitude, :yelp_url, :category)')
    connection.execute(
                  query,
                  address = address,
                  description = description,
                  name = name,
                  longitude = longitude,
                  latitude = latitude,
                  url = URL,
                  yelp_url = yelp_url,
                  category = category)
    connection.close()

    return jsonify(name=name)


@app.route('/deleteDestination', methods=['GET'])
def deleteDestination():
	id = request.args.get('id')

	engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
	connection = engine.connect()
	query = text('DELETE FROM Destinations WHERE ID=:id');
	connection.execute(query, id=id)
	connection.close()

	return jsonify(success=True)



# ex. Dinosaurs|37.7646602|-122.4321068
# get yelp json data
def getYelpInfo(name, address):
    response = None
    request_url = 'http://{0}{1}?'.format(YELP_HOST, urllib.quote(YELP_PATH.encode('utf8')))

    url_params = {
            'location':address
        }

    consumer = oauth2.Consumer(CONSUMER_KEY, CONSUMER_SECRET)
    oauth_request = oauth2.Request(method="GET", url=request_url, parameters=url_params)
    oauth_request.update(
        {
            'oauth_nonce': oauth2.generate_nonce(),
            'oauth_timestamp': oauth2.generate_timestamp(),
            'oauth_token': TOKEN,
            'oauth_consumer_key': CONSUMER_KEY
        }
    )
    token = oauth2.Token(TOKEN, TOKEN_SECRET)
    oauth_request.sign_request(oauth2.SignatureMethod_HMAC_SHA1(), consumer, token)
    signed_url = oauth_request.to_url()
    conn = urllib2.urlopen(signed_url, None)

    try:
        response = json.loads(conn.read())
    except Exception as inst:
        response = {'error':inst}
    finally:
        conn.close()

    return response








