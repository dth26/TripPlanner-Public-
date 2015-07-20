from app import app
from flask import render_template
from model import *

@app.route('/savedDirections')
@app.route('/savedDirections/')
def savedDirections():
    # get list of saved directions
    destinations = getDirectionsDestinations()
    return render_template('savedDirections.html', destinations=destinations)

