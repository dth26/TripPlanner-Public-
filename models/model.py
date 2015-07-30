from modelsDestinations import *
from modelsDirections import *

from __init__ import db
from passlib.apps import custom_app_context as pwd_context
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



@app.route('/createUser',methods=['POST'])
def createUser():
    username = request.form.get('username')
    password = request.form.get('password')

    password = pwd_context.encrypt(password)
	# connect to database
    engine = create_engine('sqlite:///' + os.path.join(basedir, 'db_file.db'), echo=True)
    connection = engine.connect()
    query = text('INSERT INTO Users(`username`,`password`) VALUES(:username, :password)')
    connection.execute(query, username = username,  password = password)
    connection.close()

    return redirect(url_for('home'))




@app.route('/login', methods=['GET', 'POST'])
def login():
	username = request.form.get('username')
	password = request.form.get('password')

	#if request.method == 'POST':
	user = Users.query.filter_by(username=username)

	if user.count() > 0 and pwd_context.verify(password, user[0].password):
	    session['username'] = user[0].username
	    return render_template('index.html', user=session)
	else:
	    session.pop('username', None)
        return render_template('home.html', user=session)



@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect(url_for('index'))




# set the secret key.  keep this really secret:
# create a session
# any script that uses session must add this line of code
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

