from flask import Blueprint, render_template, jsonify, request, send_file, session, Response, stream_with_context
from json import dumps

from ..models import *

blueprint = Blueprint('api', __name__)


# Games
@blueprint.route('/games', methods=["GET","POST","PUT","DELETE"])
def games():

    #Get all games
    if(request.method == "GET"):
        if(not request.args):
            return Response(
                response=Game.objects.to_json(),
                status=200,
                mimetype='application/json'
                )
        else:
    #Get a single game by human readable ID
            return Response(
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
@blueprint.route('/questions', methods=["GET","POST","PUT","DELETE"])
def questions():
    if(request.method == "GET"):
    #Get all questions for a given game by uri
        if('gameuri' in request.args):
            game = Game.objects(uri=request.args['gameuri'])
            if(not game):
                return None
            game = game.first()
            questions = Question.objects(game=game.id)
            return Response(
                response=questions.to_json(),
                status=200,
                mimetype='application/json'
            )
        elif('gameid' in request.args):
            questions = Question.objects(game=request.args['gameid'])
            return Response(
                response=questions.to_json(),
                status=200,
                mimetype='application/json'
            )

# Answers
@blueprint.route('/answers', methods=["GET", "POST", "PUT", "DELETE"])
def answers():


    if(request.method == "GET"):
        if('questionid' in request.args):
            question = Question.objects(id=request.args['questionid']).first()
            answers = question.answers
            ans = []
            for i in answers:
                ans.append(i.to_json())
            print(ans)
            # return ""
            return Response(
                response=dumps(ans),
                status=200,
                mimetype='application/json'
            )

# Corrects
@blueprint.route('/corrects', methods=["GET","POST","PUT","DELETE"])
def corrects():

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
                return Response(
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

@blueprint.route('/score')
def score():
    check_session()
    giveToken = False
    if(session['score'] >= session['reqdscore']):
        giveToken = True
    return {'score':str(session['score']), 'giveToken':giveToken, 'required': session['reqdscore']}


@blueprint.route('/logout')
def logout():
    check_session()
    session.pop('score', None)
    session.pop('reqdscore', None)
    session.pop('maxscore', None)
    return ""
