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
   # __table_args__ = {'extend_existing': True}

    ID = Column(Integer, primary_key=True)
    destinationID = Column(Integer)
    travelMode = Column(String)
    total_distance = Column(String)
    total_duration = Column(String)
    start_address = Column(String)
    end_address = Column(String)

    def __init__(self, ID, destinationID, travelMode, total_distance, total_duration, start_address, end_address):
        self.ID = ID
        self.destinationID = destinationID
        self.travelMode = travelMode
        self.total_distance = total_distance
        self.total_duration = total_duration
        self.end_address = end_address
        self.start_address = start_address


class Steps(db.Model):
    __tablename__ = 'Steps'
    #__table_args__ = {'extend_existing': True}

    ID = Column(Integer, primary_key=True)
    directionID = Column(Integer)
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

    def __init__(self, ID, directionID, order, travelMode, bus_id, bus_name, bus_agency, departure_time, arrival_time, departure_location, arrival_location, instruction, distance, duration, lat, lng, description):
        self.ID = ID
        self.directionID = directionID
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
    querySteps = text('INSERT INTO Steps(`directionID`,`order`,`travelMode`,`bus_id`,`bus_name`,`bus_agency`,`departure_time`,`arrival_time`,`departure_location`,`arrival_location`,`instruction`,`duration`, `distance`,`lat`,`lng`,`description`) VALUES(:directionID, :order, :travelMode, :bus_id, :bus_name, :bus_agency, :departure_time, :arrival_time, :departure_location, :arrival_location, :instruction, :duration, :distance, :lat, :lng, :description)')
    queryDirections = text('INSERT INTO Directions(`destinationID`, `travelMode`, `total_distance`, `total_duration`, `start_address`, `end_address`) VALUES(:destinationID,:travelMode, :total_distance, :total_duration, :start_address, :end_address)')


    # insert direction info into Directions table
    connection.execute(
        queryDirections,
        destinationID = parsedJSON['destinationID'],
        travelMode = parsedJSON['travelMode'],
        total_distance = parsedJSON['total_distance'],
        total_duration = parsedJSON['total_duration'],
        start_address = parsedJSON['start_address'],
        end_address = parsedJSON['end_address']
    )

    # now get id of newly created Directions row
    queryDirectionID = text('SELECT MAX(ID) as ID FROM Directions')
    directionIDResult = connection.execute(queryDirectionID)
    directionID = 0 # intitialize

    for row in directionIDResult:
        directionID = row['ID']

    attributes = ['bus_agency','bus_name','bus_id','departure_time','arrival_time','departure_location','arrival_location']

    # insert each individual step into steps table
    for step in steps:
        # make sure keys are not null or else it wull throw error
        for attr in attributes:
            if attr not in step:
                step[attr] = 'none'

        connection.execute(
            querySteps,
            directionID = directionID,
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
# populate select tag with destination names
def getDirectionsDestinations():
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('select A.ID as directionID, A.destinationID as destinationID, A.travelMode, A.total_distance as distance, A.total_duration as duration, A.start_address as start, A.end_address as end, B.name as name  \
                  from Directions as A   \
                  INNER JOIN Destinations as B \
                  on A.destinationID = B.ID')
    results = connection.execute(query)
    return results


# get directions for directionID
@app.route('/getDirectionsForDestination', methods=['GET','POST'])
def getDirectionsForDestination():
    parsedJSON = request.json
    directionID = int(parsedJSON['directionID'])
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()

    querySteps = text('SELECT * FROM Steps as S WHERE S.directionID=:directionID')
    resultSteps = connection.execute(querySteps, directionID = directionID)

    queryDirectionsInfo = text('SELECT * FROM Directions WHERE ID=:directionID')
    resultDirections = connection.execute(queryDirectionsInfo, directionID = directionID)

    # parse directionsInfo
    # create json object
    directionsInfo = {}
    for row in resultDirections:
        directionsInfo['total_distance'] = row['total_distance']
        directionsInfo['total_duration'] = row['total_duration']
        directionsInfo['end_address'] = row['end_address']
        directionsInfo['start_address'] = row['start_address']



    # parse steps into json object
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

    return jsonify(steps=steps, directionsInfo=directionsInfo)
















