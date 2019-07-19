from flask import Flask, render_template, jsonify, request, send_from_directory, redirect
from mongoengine import *
from bson.objectid import ObjectId
import json
import os
app = Flask(__name__,static_url_path='/static')

class Answer(EmbeddedDocument):
    _id = ObjectIdField( required=True, default=lambda: ObjectId() )
    answer = StringField()
    correct = BooleanField()

class Game(Document):
    meta = {'collection': 'games'}
    # _id = ObjectIdField( required=True, default=lambda: ObjectId() )
    uri = StringField()
    name = StringField()
    description = StringField()

class Question(Document):
    meta = {'collection': 'questions'}
    # _id = ObjectIdField( required=True, default=lambda: ObjectId() )
    question = StringField()
    answers = EmbeddedDocumentListField(Answer)
    game = ReferenceField(Game)



@app.route('/')
def index():
    return redirect('/play/introduction-to-the-employee-handbook')

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.route('/play/<uri>')
def play(uri):
    connect('game')
    game = Game.objects(uri=uri).first()
    if(not game):
        return redirect("/404")
    return render_template("index.html", name=game.name)

@app.route('/404')
def error():
    return render_template("404.html")

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                          'favicon.ico',mimetype='image/vnd.microsoft.icon')

@app.route('/json', methods={"POST"})
def data():
    connect('game')
    return Question.objects.to_json()

@app.route('/admin')
def admin():
    return render_template("dashboard.html")

@app.route('/admin/info')
def info():
    return render_template("info.html")

@app.route('/admin/create')
def create():
    return render_template("create.html")

#REST API

#Games
@app.route('/api/games', methods=["GET","POST","PUT","DELETE"])
def games():
    connect('game')

    #Get all games
    if(request.method == "GET"):
        if(not request.args):
            return app.response_class(
                response=Game.objects.to_json(),
                status=200,
                mimetype='application/json'
                )
        else:
    #Get a single game by human readable ID
            return app.response_class(
                response=Game.objects(uri=request.args["uri"]).first().to_json(),
                status=200,
                mimetype='application/json'
            )



    #Create a game
    if(request.method == "POST"):
        return request.form

    #Update a game
    #TODO

    #Delete a game
    #TODO

#Questions
@app.route('/api/questions', methods=["GET","POST","PUT","DELETE"])
def questions():
    connect('game')

    if(request.method == "GET"):
    #Get all questions for a given game by uri
        if('gameuri' in request.args):
            game = Game.objects(uri=request.args['gameuri'])
            if(not game):
                return None
            game = game.first()
            questions = Question.objects(game=game.id)
            return app.response_class(
                response=questions.to_json(),
                status=200,
                mimetype='application/json'
            )
        elif('gameid' in request.args):
            questions = Question.objects(game=request.args['gameid'])
            return app.response_class(
                response=questions.to_json(),
                status=200,
                mimetype='application/json'
            )

@app.route('/test/create', methods=["POST"])
def testcreate():
    connect('game')

    game1 = Game.objects(uri="introduction-to-the-employee-handbook").first()
    if(not game1):
        game1 = Game()
    game1.uri="introduction-to-the-employee-handbook"
    game1.name="Introduction to the Employee Handbook"
    game1.description="Welcome to the Immersive Labs Employee Handbook."
    game1.save()

    game2 = Game.objects(uri="immersive-labs-house-rules").first()
    if(not game2):
        game2 = Game()
    game2.uri="immersive-labs-house-rules"
    game2.name="Immersive Labs’ House Rules"
    game2.description="Think of this lab as the ultimate ‘How to...’ guide, outlining the dos and don’ts of Immersive Labs and Runway East (RWE) – what better way to ensure Immersive Labs remains an exceptional place to work?"
    game2.save()

    q = Question.objects(question="Immersive Labs is an equal opportunity employer – this means we do not discriminate against potential employees based on...").first()
    if(not q):
        q = Question()
    a1 = Answer(answer="Age, race, nationality and/or disability")
    a2 = Answer(answer="Gender, sexual orientation and/or gender reassignment")
    a3 = Answer(answer="Religion or belief")
    a4 = Answer(answer="None of the above")
    a5 = Answer(answer="All of the above ONLY")
    a6 = Answer(answer="Any person’s individual, personal or social characteristics", correct="true")
    q.question="Immersive Labs is an equal opportunity employer – this means we do not discriminate against potential employees based on..."
    q.answers=[a1,a2,a3,a4,a5,a6]
    q.game=game1
    q.save()

    q = Question.objects(question="The employee handbook may be amended at any point, at the discretion of the company.").first()
    if(not q):
        q = Question()
    a1 = Answer(answer="True", correct="true")
    a2 = Answer(answer="False")
    q.question="The employee handbook may be amended at any point, at the discretion of the company."
    q.answers=[a1,a2]
    q.game=game1
    q.save()

    q = Question.objects(question="Are you allowed to vape in the office?").first()
    if(not q):
        q = Question()
    a1 = Answer(answer="No", correct="true")
    a2 = Answer(answer="Yes")
    q.question="Are you allowed to vape in the office?"
    q.answers=[a1,a2]
    q.game=game2
    q.save()

    return "true"
