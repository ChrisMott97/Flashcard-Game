from flask import Blueprint, render_template, jsonify, request, send_file, session, redirect
from mongoengine import connect

from ..models import Game
from .api import check_session

blueprint = Blueprint('game', __name__)

@blueprint.route('/')
def index():
    return redirect('/play/darknets')
# Play
@blueprint.route('/play/<uri>')
def play(uri):
    check_session()
    session['score'] = 0
    game = Game.objects(uri=uri).first()
    if(not game):
        return redirect("/404")
    session['maxscore'] = game.totalQuestions
    session['reqdscore'] = game.totalQuestionsRequired
    return render_template("index.html", name=game.name, description=game.description)

# Error route doesn't exist
@blueprint.route('/404')
def error():
    return render_template("404.html"), 404

# Test React
@blueprint.route('/react')
def react():
    return render_template('test.html')