from flask import Blueprint, render_template, jsonify, request, send_file, redirect, url_for

blueprint = Blueprint('admin', __name__)

# Admin 
@blueprint.route('/')
def admin():
    return redirect(url_for("admin.info"))

# Admin info
@blueprint.route('/info')
def info():
    return render_template("admin.html")

# Admin create
@blueprint.route('/create')
def create():
    return render_template("create.html")