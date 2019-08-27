import os
from dotenv import load_dotenv

class Config(object):
    load_dotenv('../.env')
    ENV = os.environ.get('FLASK_ENV')
    SECRET_KEY = os.environ.get('SECRET_KEY')


class Production(Config):
    DEBUG = False
    MONGODB_HOST = os.environ.get('MONGODB_HOST')


class Development(Config):
    DEBUG = True
    MONGODB_HOST = "mongodb://localhost/game"


class Testing(Config):
    TESTING = True
    DEBUG = True
    MONGODB_HOST = os.environ.get('MONGODB_HOST')
