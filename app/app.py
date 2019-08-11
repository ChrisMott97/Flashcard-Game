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

#########################################################################
# MODELS                                                                #
#########################################################################
class Answer(Document):
    meta = {'collection': 'answers'}
    answer = StringField()
    explain = StringField()

class Game(Document):
    meta = {'collection': 'games'}
    uri = StringField()
    name = StringField()
    description = StringField()
    totalQuestions = IntField()
    totalQuestionsRequired = IntField()

class Question(Document):
    meta = {'collection': 'questions'}
    question = StringField()
    answers = ListField(ReferenceField(Answer))
    game = ReferenceField(Game)

class Correct(Document):
    meta = {'collection': 'corrects'}
    question = ReferenceField(Question)
    answer = ReferenceField(Answer)


#########################################################################
# Routes                                                                #
#########################################################################

# Root
@app.route('/')
def index():
    return redirect('/play/introduction-to-the-employee-handbook')

# Play
@app.route('/play/<uri>')
def play(uri):
    connect('game')
    check_session()
    session['score'] = 0
    game = Game.objects(uri=uri).first()
    if(not game):
        return redirect("/404")
    session['maxscore'] = game.totalQuestions
    session['reqdscore'] = game.totalQuestionsRequired
    return render_template("index.html", name=game.name, description=game.description)

# Error route doesn't exist
@app.route('/404')
def error():
    return render_template("404.html"), 404

# Load favicon
@app.errorhandler(404)
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static/assets'),
                          'favicon.ico',mimetype='image/vnd.microsoft.icon')

# Test React
@app.route('/react')
def react():
    return render_template('test.html')

# Admin 
@app.route('/admin')
def admin():
    return redirect('/admin/info')

# Admin info
@app.route('/admin/info')
def info():
    return render_template("admin.html")

# Admin create
@app.route('/admin/create')
def create():
    return render_template("create.html")

#########################################################################
# REST API                                                              #
#########################################################################

# Games
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
        if('game' in request.json):
            json = request.json['game']
            errors = validate_game(json)
            if(not errors):
                game = Game()
                game.uri = json['gameUri']
                game.name = json['gameName']
                game.description = json['gameDesc']
                game.totalQuestions = json['totalQuestions']
                game.totalQuestionsRequired = json['totalQuestionsRequired']
                game.save()

                for question in json['questions']:
                    q = Question()
                    c = Correct()
                    q.game = game
                    q.question = question['name']
                    q.answers = []
                    for answer in question['answers']:
                        a = Answer()
                        a.answer = answer['name']
                        a.explain = answer['explain']
                        a.save()
                        q.answers.append(a)
                        if(answer['correct']):
                            c.question = q
                            c.answer = a
                    q.save()
                    c.save()

            return jsonify(errors)

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

# Answers
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

# Corrects
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
            else:
                correct = Correct.objects(question=request.args['questionid']).first()
                return app.response_class(
                    response=correct.to_json(),
                    status=200,
                    mimetype='application/json'
                )
        return "false"



###################################################################
# Utility                                                         #
###################################################################

def validate_game(game):
    errors = []
    if(not game['gameName']):
        errors.append("Game name can't be empty!")
    if(not game['gameDesc']):
        errors.append("Game description can't be empty!")
    if(not game['gameUri']):
        errors.append("Game URI can't be empty!")
    if(not game['totalQuestions']):
        errors.append("Unable to count total questions!")
    if(not game['totalQuestionsRequired']):
        errors.append("Must specific required amount of questions!")
    questionsCorrectMissing = False
    questionsNameEmpty = False
    for question in game['questions']:
        if(not question['name']):
            questionsNameEmpty = True
        anyCorrect = False
        for answer in question['answers']:
            if(not answer['name']):
                errors.append("No answers should be empty!")
            if(not answer['explain']):
                errors.append("All answers should have explanations!")
            if(answer['correct']):
                anyCorrect = True
        if(not anyCorrect):
            errors.append("All questions must have a correct answer!")
            
    print(errors)
    return errors

def check_session():
    if('score' in session):
        return True
    score = session['score'] = 0
    return False

@app.route('/api/score')
def score():
    check_session()
    giveToken = False
    if(session['score'] >= session['reqdscore']):
        giveToken = True
    return {'score':str(session['score']), 'giveToken':giveToken, 'required': session['reqdscore']}


@app.route('/api/logout')
def logout():
    check_session()
    session.pop('score', None)
    session.pop('reqdscore', None)
    session.pop('maxscore', None)
    return ""


# @app.route('/test/create', methods=["POST"])
# def testcreate():
#     db = connect('game')

#     db.drop_database('game')

#     connect('game')

#     game = Game()
#     game.uri="introduction-to-the-employee-handbook"
#     game.name="Introduction to the Employee Handbook"
#     game.description="Welcome to the Immersive Labs Employee Handbook."
#     game.save()
    
#     q = Question()
#     a1 = Answer(answer="Age, race, nationality and/or disability").save()
#     a2 = Answer(answer="Gender, sexual orientation and/or gender reassignment").save()
#     a3 = Answer(answer="All of the above ONLY").save()
#     a4 = Answer(answer="Any person’s individual, personal or social characteristics").save()
#     q.question="Immersive Labs is an equal opportunity employer – this means we do not discriminate against potential employees based on..."
#     q.answers=[a1,a2,a3,a4]
#     q.game=game
#     q.save()

#     c = Correct(question=q, answer=a4)
#     c.save()

#     q = Question()
#     a1 = Answer(answer="True").save()
#     a2 = Answer(answer="False").save()
#     q.question="The employee handbook may be amended at any point, at the discretion of the company."
#     q.answers=[a1,a2]
#     q.game=game
#     q.save()

#     c = Correct(question=q, answer=a1)
#     c.save()

#     game = Game()
#     game.uri="immersive-labs-house-rules"
#     game.name="Immersive Labs’ House Rules"
#     game.description="Think of this lab as the ultimate ‘How to...’ guide, outlining the dos and don’ts of Immersive Labs and Runway East (RWE) – what better way to ensure Immersive Labs remains an exceptional place to work?"
#     game.save()

#     q = Question()
#     a1 = Answer(answer="No").save()
#     a2 = Answer(answer="Yes").save()
#     q.question="Are you allowed to vape in the office?"
#     q.answers=[a1,a2]
#     q.game=game
#     q.save()

#     c = Correct(question=q, answer=a1)
#     c.save()

#     return "true"


