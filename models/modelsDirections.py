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

    def __init__(self, ID, destinationID, order, travelMode, bus_id, bus_name, bus_agency, departure_time, arrival_time, departure_location, arrival_location, instruction, distance, duration, lat, lng):
        self.ID = ID
        self.destinationID = destinationID
        self.order = order
        self.travelMode = travelMode
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
    parsedJSON = request.json

    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()

    steps = parsedJSON['steps']
    querySteps = text('INSERT INTO Steps(`destinationID`,`order`,`travelMode`,`bus_id`,`bus_name`,`bus_agency`,`departure_time`,`arrival_time`,`departure_location`,`arrival_location`,`instruction`,`duration`, `distance`,`lat`,`lng`) VALUES(:destinationID, :order, :travelMode, :bus_id, :bus_name, :bus_agency, :departure_time, :arrival_time, :departure_location, :arrival_location, :instruction, :duration, :distance, :lat, :lng)')
    queryDirections = text('INSERT INTO Directions(`destinationID`, `travelMode`) VALUES(:destinationID,:travelMode)')

    # insert direction info into Directions table
    connection.execute(
        queryDirections,
        destinationID = parsedJSON['destinationID'],
        travelMode = parsedJSON['travelMode'],
    )

    attributes = ['bus_agency','bus_name','bus_id','departure_time','arrival_time','departure_location','arrival_location']

    # insert each individual step into steps table
    for step in steps:
        '''
        if 'bus_agency' not in step:
            step['bus_agency'] = 'none'
        if 'bus_name' not in step:
            step['bus_name'] = 'none'
        if 'bus_id' not in step:
            step['bus_id'] = 'none'
        '''
        # make sure keys are not null or else it wull throw error
        for attr in attributes:
            if attr not in step:
                step[attr] = 'none'

        connection.execute(
            querySteps,
            destinationID = parsedJSON['destinationID'],
            travelMode = step['travel_mode'],
            order = step['order'],
            transit_name = step['bus_agency'],
            bus_id = step['bus_id'],
            bus_name = step['bus_name'],
            bus_agency = step['bus_agency'],
            departure_time = step['departure_time'],
            arrival_time = step['arrival_time'],
            departure_location = step['departure_location'],
            arrival_location = step['arrival_location'],
            instruction = step['description'],
            duration = step['durationText'],
            distance = step['distanceText'],
            lat = step['lat'],
            lng = step['lng']
        )
    connection.close()

    return jsonify({ 'message': 'Directions Saved Succesfully!'})












