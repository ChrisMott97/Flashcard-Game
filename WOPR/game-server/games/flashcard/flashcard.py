from flask import Blueprint, render_template, jsonify, request, send_file, session, redirect
from mongoengine import connect

from common import get_user_session, create_user_session
from global_tables import GlobalSessions, GlobalLeaderboard

from games.flashcard.models import Game
from games.flashcard.flashcardapi import check_session

flashcard = Blueprint(
    'flashcard',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/flashcard'
)

@flashcard.route('/flashcard/<uri>')
def play(uri):
    check_session()
    session['score'] = 0
    game = Game.objects(uri=uri).first()
    if(not game):
        game = Game.objects().first()
        if(not game):
            return "404", 404
        return redirect('/flashcard/'+game.uri)
    session['maxscore'] = game.totalQuestions
    session['reqdscore'] = game.totalQuestionsRequired
    return render_template("index.html", name=game.name, description=game.description)
