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
    description = Column(String)

    def __init__(self, ID, destinationID, order, travelMode, bus_id, bus_name, bus_agency, departure_time, arrival_time, departure_location, arrival_location, instruction, distance, duration, lat, lng, description):
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
        self.description = description


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
    querySteps = text('INSERT INTO Steps(`destinationID`,`order`,`travelMode`,`bus_id`,`bus_name`,`bus_agency`,`departure_time`,`arrival_time`,`departure_location`,`arrival_location`,`instruction`,`duration`, `distance`,`lat`,`lng`,`description`) VALUES(:destinationID, :order, :travelMode, :bus_id, :bus_name, :bus_agency, :departure_time, :arrival_time, :departure_location, :arrival_location, :instruction, :duration, :distance, :lat, :lng, :description)')
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
            lng = step['lng'],
            description = step['description']
        )
    connection.close()

    return jsonify({'message': 'Directions Saved Succesfully!'})


# get list of destinations for saved directions
def getDirectionsDestinations():
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('select A.destinationID,B.name from Directions as A INNER JOIN Destinations as B on A.destinationID = B.ID')
    results = connection.execute(query)
    return results


# get directions for destinationID
@app.route('/getDirectionsForDestination', methods=['GET','POST'])
def getDirectionsForDestination():
    parsedJSON = request.json
    destination_name = parsedJSON['destination_name']
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()

    query = text('SELECT * FROM Steps WHERE destinationID=(SELECT ID FROM Destinations WHERE name=:destination_name)')
    resultSteps = connection.execute(query, destination_name = destination_name)

    dictionary = []     #json object
    steps = []

    for s in resultSteps:
        step, duration, distance, start_location  = {}, {}, {}, {}
        transit, arrival_stop, arrival_time, departure_stop, departure_time = {}, {}, {}, {}, {}
        line, agencies, agencyObject = {}, [], {}


        duration['text'] = s.duration
        distance['text'] = s.distance
        start_location['A'] = s.lat
        start_location['F'] = s.lng

        # set transit info
        agencyObject['name'] = s.bus_agency
        agencies.append(agencyObject)
        arrival_stop['name'] = s.arrival_location
        arrival_time['text'] =  s.arrival_time
        departure_stop['name'] = s.departure_location
        departure_time['text'] = s.departure_time
        line['name'] = s.bus_name
        line['short_name'] = s.bus_id
        line['agencies'] = agencies
        transit['line'] = line
        transit['arrival_stop'] = arrival_stop
        transit['arrival_time'] = arrival_time
        transit['departure_stop'] = departure_stop
        transit['departure_time'] = departure_time

        step['transit'] = transit
        step['distance'] = distance
        step['duration'] = duration
        step['start_location'] = start_location
        step['order'] = s.order
        step['travel_mode'] = s.travelMode
        step['instructions'] = s.description

        steps.append(step)

    connection.close()

    return jsonify(steps=steps)

















