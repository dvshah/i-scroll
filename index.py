import pickle
import base64
import cv2
import numpy as np
from flask import Flask, request
from io import StringIO
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = pickle.load(open('model.pickle', 'rb'))
bgModel = None

def data_uri_to_cv2_img(uri):
    uri = uri.split(",")[1]
    uri = base64.b64decode(uri)
    with open('0.jpg', 'wb') as f:
        f.write(uri)

def removeBG(frame):
    global bgModel
    fgmask = bgModel.apply(frame,learningRate=0)
    # kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    # res = cv2.morphologyEx(fgmask, cv2.MORPH_OPEN, kernel)

    kernel = np.ones((3, 3), np.uint8)
    fgmask = cv2.erode(fgmask, kernel, iterations=1)
    res = cv2.bitwise_and(frame, frame, mask=fgmask)
    return res

@app.route("/", methods = [ 'POST' ])
def imageParser():
    global bgModel
    if request.method == 'POST':
        encode = request.form['encode']
        data_uri_to_cv2_img(encode)
        frame = cv2.imread('0.jpg')
        frame = cv2.bilateralFilter(frame, 5, 50, 100)
        frame = cv2.flip(frame, 1)
        cv2.rectangle(frame, (int(0.7 * frame.shape[1]), 0), (frame.shape[1], int(0.5 * frame.shape[0])), (255, 0, 0), 2)

        if bgModel is None :
            bgModel = cv2.createBackgroundSubtractorMOG2(0, 50)
        else:
            img = removeBG(frame)
            img = img[0:int(0.5 * frame.shape[0]), int(0.7 * frame.shape[1]):frame.shape[1]]
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (41, 41), 0)
            ret, thresh = cv2.threshold(blur, 60, 255, cv2.THRESH_BINARY)
            oneD = thresh.flatten().tolist()
            result = model.predict([oneD])[0]

        return str(result)

if __name__ == '__main__':
    app.run()