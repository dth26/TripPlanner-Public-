from flask import Flask               # import Flask library from flask package

app = Flask(__name__)


# must import all views called in application
from viewHome import *
from viewNew import *
from viewDirections import *
from viewLayout import *