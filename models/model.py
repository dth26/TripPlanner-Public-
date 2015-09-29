from modelsDestinations import *
from modelsDirections import *
from yelpScraper import *

from __init__ import db
from sqlalchemy import *
from sqlalchemy.orm import relationship, backref
from flask import request, url_for, render_template, redirect, session

basedir = "/home/tripplanner/mysite"

class Users(db.Model):
	__tablename__ = 'Users'
	__table_args__ = {'extend_existing': True}			# ONLY IF TABLE ALREADY EXISTS IN DATABASE

	userID = Column(Integer, primary_key = True)
	username = Column(String)
	password = Column(String)

	def __init__(self, userID, password, username):
		self.userID = userID
		self.password = password
		self.username = username



# Initialize database schema (create tables)
db.create_all()



@app.route('/createUser',methods=['GET'])
def createUser():

    if request.args.get('key', type=str) != 'tripplanner':
        return jsonify(success=False)

    username = request.args.get('username', type=str)
    password = request.args.get('password', type=str)

    password = pwd_context.encrypt(password)
	# connect to database
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('INSERT INTO Users(`username`,`password`) VALUES(:username, :password)')
    connection.execute(query, username = username,  password = password)
    connection.close()

    return jsonify(success=True)




@app.route('/login', methods=['GET', 'POST'])
def login():
	username = request.args.get('username', type=str)
	password = request.args.get('password', type=str)

	#if request.method == 'POST':
	user = Users.query.filter_by(username=username)

	if user.count() > 0 and pwd_context.verify(password, user[0].password):
	    session['isLogged'] = True
	    session['username'] = username
	    return jsonify(session)
	else:
	    session['isLogged'] = False
	    session['username'] = ''
	    return jsonify(session)


@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session['isLogged'] = False
    session['username'] = ''
    return jsonify(session);


@app.route('/isLogged', methods=['GET'])
def isLogged():
    return jsonify(session);


