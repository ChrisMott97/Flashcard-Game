# Documentation

## Build Instructions
### Basic Build
```
sudo docker-compose up
```
### Full Rebuild
```
sudo docker container prune && sudo docker-compose up --build
```

## Architecture
### Backend
Flask is used for the backend, with itself and other dependencies installing via requirements.txt.
Outside docker this can be utilized using `pip install -r requirements.txt`
### Frontend
NPM is used for the frontend dependencies. Outside of docker, these can be installed using `npm install`
Webpack is used to package everything together, it also manages transpiling. The package.json is used to specify the watch proccess for this. To watch files with webpack outside of Docker, run `npm run watch`.

## Production
Currently no settings have been made for a production environment - this is a work in progress.
Results of this build should be taken using a multi-stage build process - no `docker-compile.yml` file should be used.

## TODO
The database also currently wipes itself for every build - have a set of test migrations would be helpful.
Testing also needs to be done.
