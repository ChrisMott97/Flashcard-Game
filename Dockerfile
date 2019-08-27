FROM python:3

LABEL maintainer="chris.mott@immersivelabs.co.uk"

WORKDIR /app

COPY ./requirements.txt ./

RUN pip install -r requirements.txt