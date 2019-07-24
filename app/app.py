from flask import Flask, render_template, jsonify, request, send_from_directory, redirect, session
from mongoengine import *
from bson.objectid import ObjectId
from bson.json_util import dumps
import json
import os

app = Flask(__name__,
    static_url_path='/static/'
)
app.secret_key = b'\xae\xdf@G\xa4\xde\xfcti;e3>\xcb\x13m'

class Answer(Document):
    meta = {'collection': 'answers'}
    answer = StringField()

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
    answers = ListField(ReferenceField(Answer))
    game = ReferenceField(Game)

class Correct(Document):
    meta = {'collection': 'corrects'}
    question = ReferenceField(Question)
    answer = ReferenceField(Answer)

def check_session():
    if('score' in session):
        return True
    score = session['score'] = 0
    return False


@app.route('/')
def index():
    return redirect('/play/introduction-to-the-employee-handbook')


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.route('/play/<uri>')
def play(uri):
    connect('game')
    check_session()
    session['score'] = 0
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

@app.route('/test/test')
def testtest():
    return render_template("blank.html")

#REST API

#Games
@app.route('/api/games', methods=["GET","POST","PUT","DELETE"])
def games():
    connect('game')

    #Get all games
    if(request.method == "GET"):
        if(not request.args):
            print(type(Game.objects))
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

@app.route('/api/answers', methods=["GET", "POST", "PUT", "DELETE"])
def answers():
    connect('game')

    if(request.method == "GET"):
        if('questionid' in request.args):
            question = Question.objects(id=request.args['questionid']).first()
            answers = question.answers
            ans = []
            for i in answers:
                ans.append(i.to_json())
            print(ans)
            # return ""
            return app.response_class(
                response=dumps(ans),
                status=200,
                mimetype='application/json'
            )

@app.route('/api/corrects', methods=["GET","POST","PUT","DELETE"])
def corrects():
    connect('game')
    check_session()

    if(request.method == "GET"):
        if('questionid' in request.args):
            if('answerid' in request.args):
                correct = Correct.objects(question=request.args['questionid'], answer=request.args['answerid']).first()
                if(correct):
                    session['score'] += 1
                    return "true"
        return "false"

@app.route('/api/score')
def score():
    check_session()
    return str(session['score'])

@app.route('/api/logout')
def logout():
    check_session()
    session.pop('score', None)
    return ""


@app.route('/test/create', methods=["POST"])
def testcreate():
    db = connect('game')

    db.drop_database('game')

    connect('game')

    game = Game()
    game.uri="introduction-to-the-employee-handbook"
    game.name="Introduction to the Employee Handbook"
    game.description="Welcome to the Immersive Labs Employee Handbook."
    game.save()
    
    q = Question()
    a1 = Answer(answer="Age, race, nationality and/or disability").save()
    a2 = Answer(answer="Gender, sexual orientation and/or gender reassignment").save()
    a3 = Answer(answer="All of the above ONLY").save()
    a4 = Answer(answer="Any person’s individual, personal or social characteristics").save()
    q.question="Immersive Labs is an equal opportunity employer – this means we do not discriminate against potential employees based on..."
    q.answers=[a1,a2,a3,a4]
    q.game=game
    q.save()

    c = Correct(question=q, answer=a4)
    c.save()

    q = Question()
    a1 = Answer(answer="True").save()
    a2 = Answer(answer="False").save()
    q.question="The employee handbook may be amended at any point, at the discretion of the company."
    q.answers=[a1,a2]
    q.game=game
    q.save()

    c = Correct(question=q, answer=a1)
    c.save()

    game = Game()
    game.uri="immersive-labs-house-rules"
    game.name="Immersive Labs’ House Rules"
    game.description="Think of this lab as the ultimate ‘How to...’ guide, outlining the dos and don’ts of Immersive Labs and Runway East (RWE) – what better way to ensure Immersive Labs remains an exceptional place to work?"
    game.save()

    q = Question()
    a1 = Answer(answer="No").save()
    a2 = Answer(answer="Yes").save()
    q.question="Are you allowed to vape in the office?"
    q.answers=[a1,a2]
    q.game=game
    q.save()

    c = Correct(question=q, answer=a1)
    c.save()

    return "true"
