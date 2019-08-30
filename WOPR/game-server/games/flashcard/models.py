from mongoengine import *

class Answer(Document):
    meta = {'collection': 'flashcard_answers'}
    answer = StringField()
    explain = StringField()

class Game(Document):
    meta = {'collection': 'flashcard_games'}
    uri = StringField()
    name = StringField()
    description = StringField()
    totalQuestions = IntField()
    totalQuestionsRequired = IntField()

class Question(Document):
    meta = {'collection': 'flashcard_questions'}
    question = StringField()
    answers = ListField(ReferenceField(Answer))
    game = ReferenceField(Game)

class Correct(Document):
    meta = {'collection': 'flashcard_corrects'}
    question = ReferenceField(Question)
    answer = ReferenceField(Answer)
