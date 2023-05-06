# import libraries to control django,responces and images  
from django.http import HttpResponse
from django.shortcuts import render, redirect
from .models import *
from django.views.decorators import gzip
import cv2
import asl.dorwBoundingBoxes  as file
import numpy as np
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

import re
import base64

# libraty for text to speech(for talking part)
import pyttsx3
engine=pyttsx3.init()
# setup pyttsx3 for talking
voices=engine.getProperty('voices')
engine.setProperty('voice',voices[1].id)
engine.setProperty('rate',120)


# main function to return index.html(render main web page)
@gzip.gzip_page
def home(request):
    return render(request, 'index_final.html')


# function to get images and detect hands,letters and return last image
@csrf_exempt
def imageData(request):
    if request.method == "POST":
        ImageData = request.POST.get('image')
    
        dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
        ImageData = dataUrlPattern.match(ImageData).group(2)

        # If none or len 0, means illegal image data
        if (ImageData == None or len(ImageData)) == 0:
            pass

        ImageData = base64.b64decode(ImageData)
        ImageData = np.frombuffer(ImageData, dtype=np.uint8)
        image = cv2.imdecode(ImageData, flags=1)
        
        image,letter=file.findLetters(cv2,image)
        _, jpeg = cv2.imencode('.jpg', image)

        encoded_string = base64.b64encode(jpeg)
        # return HttpResponse(encoded_string)
        return JsonResponse({"image":str(encoded_string),"letter":letter})


# function for talking part
def sayWord(request):
    global engine
    if request.method == "POST":
        word = request.POST.get('word').lower()
        try:
            # Convert text to speech
            if word!="":
                engine.say(word)  #saying word or sentence
            engine.runAndWait()
        except:
            engine.endLoop()
            
    return HttpResponse("ok")


def contactus_view(request):
    # print('ok')
    return render(request, 'contactus.html')

def about(request):
    return redirect('aboutus.html')


