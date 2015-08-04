from model import AirportCode, connect_to_db, db
from flask import Flask, render_template, redirect, request, flash, session

app = Flask(__name__)

app.secret_key = "Susan Secret Key"