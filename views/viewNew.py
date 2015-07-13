from app import app
from flask import render_template

@app.route('/')
@app.route('/new')
@app.route('/new/')
def createNew():
	return render_template('new.html')