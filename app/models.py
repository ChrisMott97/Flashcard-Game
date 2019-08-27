from mongoengine import *

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
