from __init__ import db
from sqlalchemy import *
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import relationship, backref
from flask import request, url_for, render_template, redirect, session, jsonify
from app import app
import sys
import os
import json
import requests


basedir = "/home/tripplanner/mysite"



class Directions(db.Model):
    __tablename__ = 'Directions'
    __table_args__ = {'extend_existing': True}

    ID = Column(Integer, primary_key=True)
    destinationID = Column(Integer)
    name = Column(String)
    travelMode = Column(String)

    def __init__(self, ID, destinationID, name, travelMode):
        self.ID = ID
        self.destinationID = destinationID
        self.name = name
        self.travelMode = travelMode


class Steps(db.Model):
    __tablename__ = 'Steps'
    __table_args__ = {'extend_existing': True}

    ID = Column(Integer, primary_key=True)
    destinationID = Column(Integer)
    order = Column(Integer)
    travelMode = Column(String)
    transit_name = Column(String)
    bus_id = Column(String)
    bus_name = Column(String)
    bus_agency = Column(String)
    departure_time = Column(String)
    arrival_time = Column(String)
    departure_location = Column(String)
    arrival_location = Column(String)
    instruction = Column(String)
    duration = Column(String)
    distance = Column(String)
    lat = Column(DECIMAL)
    lng = Column(DECIMAL)

    def __init__(self, ID, destinationID, order, travelMode, transit_name, bus_id, bus_name, bus_agency, departure_time, arrival_time, departure_location, arrival_location, instruction, distance, duration, lat, lng):
        self.ID = ID
        self.destinationID = destinationID
        self.order = order
        self.travelMode = travelMode
        self.transit_name = transit_name
        self.bus_id = bus_id
        self.bus_name = bus_name
        self.bus_agency = bus_agency
        self.departure_time = departure_time
        self.departure_location = departure_location
        self.arrival_location = arrival_location
        self.arrival_time = arrival_time
        self.instruction = instruction
        self.distance = distance
        self.duration = duration
        self.lat = lat
        self.lng = lng


db.create_all()


'''
    flask 0.9
    http://flask.pocoo.org/docs/0.9/api/
        -> ctrl-f 'json'
'''

@app.route('/saveDirections', methods=['GET','POST'])
def saveDirections():

    # get json passed from ajax call
    # use request.json() if this fails
    #directions = request.get_json()
    parsedJSON = request.json
    ############################
    #save parsedJSON to a file##
    ############################
    return render_template('home.html',parsedJSON=parsedJSON)

    name = parseJSON['travelMode']

    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    testQuery = text('INSERT INTO Steps(`travelMode`) VALUES(:name)')
    connection.execute(testQuery,
        name=name)
    connection.close()

    steps = directions['steps']
    querySteps = text('INSERT INTO Steps(`order`,`travelMode`,`transit_name`,`bus_id`,`bus_name`,`bus_agency`,`departure_time`,`arrival_time`,`departure_location`,`arrival_location`,`instruction`,`duration`, `distance`,`lat`,`lng`) VALUES(:order, :travelMode, :transit_name, :bus_id, :bus_name, :bus_agency, :departure_time, :arrival_time, :departure_location, :arrival_location, :instruction, :duration, :distance, :lat, :lng)')
    queryDirections = text('INSERT INTO Directions(`destinationID`,`name`, `travelMode`) VALUES(:destinationID, :name, :travelMode)')

    # insert direction info into Directions table
    connection.execute(
        queryDirections,
        destinationID = directions['destinationID'],
        travelMode = directions['travelMode']
    )

    # insert each individual step into steps table
    for step in steps:
        connection.execute(
            querySteps,
            destinationID = directions['destinationID'],
            travelMode = step['travel_mode'],
            order = step['order'],
            transit_name = Column(String),
            bus_id = step['bus_id'],
            bus_name = step['bus_name'],
            bus_agency = step['bus_agency'],
            departure_time = step['departure_time'],
            arrival_time = step['arrival_time'],
            departure_location = step['departure_location'],
            arrival_location = step['arrival_location'],
            instruction = step['description'],
            duration = step['distanceText'],
            distance = step['distanceText'],
            lat = step['lat'],
            lng = step['lng']
        )
    connection.close()














