from app import app
from flask import render_template
from model import *

@app.route('/savedDirections')
@app.route('/savedDirections/')
def savedDirections():
	return render_template('savedDirections.html')

