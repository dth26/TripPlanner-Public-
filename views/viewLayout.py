from app import app
from flask import render_template
from model import *

@app.route('/layout')
@app.route('/layout/')
def layout():
	return render_template('layout.html')

