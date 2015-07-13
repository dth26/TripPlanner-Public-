from app import app
from flask import render_template
from model import *

@app.route('/')
@app.route('/home')
@app.route('/home/')
def home():
	return render_template('home.html')