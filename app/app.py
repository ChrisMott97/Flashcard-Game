from flask import Flask, render_template, jsonify, request, send_from_directory, redirect, session
from mongoengine import *
from .config import Development
from . import views

def create_app(config=Development):
    app = Flask(__name__, static_url_path='/static')
    app.config.from_object(config)
    connect(host=app.config['MONGODB_HOST'])
    register_blueprints(app)

    return app

def register_blueprints(app):
    app.register_blueprint(views.game.blueprint, url_prefix="/")
    app.register_blueprint(views.admin.blueprint, url_prefix="/admin")
    app.register_blueprint(views.api.blueprint, url_prefix="/api")