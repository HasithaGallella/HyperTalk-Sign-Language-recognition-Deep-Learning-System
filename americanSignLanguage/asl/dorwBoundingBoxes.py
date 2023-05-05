
import numpy as np
import mediapipe as mp       #detect and capture only hands from full image
import skimage        #to resize images
import tensorflow as tf   #to load and use model
import re   



# Initialize the mediapipe hands class.
mp_hands = mp.solutions.hands
# Initialize the mediapipe drawing class.
mp_drawing = mp.solutions.drawing_utils
classes=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","","","SPACE"]
word=""

#loading model
model=tf.keras.models.load_model("asl/ASL.h5")

# function to detect hand landmarks
def detectHandsLandmarks(image, hands,camera):
    output_image = image.copy()
    imgRGB = camera.cvtColor(image, camera.COLOR_BGR2RGB)
    results = hands.process(imgRGB) 
    return output_image, results

# function to drow bounding box around hand(Green color box in web site)
def drawBoundingBoxes(image, results,camera,padd_amount = 50, draw=True):
    # Create a copy of the input image to draw bounding boxes on and write hands types labels.
    output_image = image.copy()
    # Get the height and width of the input image.
    height, width, _ = image.shape

    # Iterate over the found hands.
    for hand_index, hand_landmarks in enumerate(results.multi_hand_landmarks):
        landmarks = []
        # Iterate over the detected landmarks of the hand.
        for landmark in hand_landmarks.landmark:
            # Append the landmark into the list.
            landmarks.append((int(landmark.x * width), int(landmark.y * height),
                                  (landmark.z * width)))

        # Get all the x-coordinate values from the found landmarks of the hand.
        x_coordinates = np.array(landmarks)[:,0]
        
        # Get all the y-coordinate values from the found landmarks of the hand.
        y_coordinates = np.array(landmarks)[:,1]
        
        # Get the bounding box coordinates for the hand with the specified padding.
        x1  = int(np.min(x_coordinates) - padd_amount)
        y1  = int(np.min(y_coordinates) - padd_amount)
        x2  = int(np.max(x_coordinates) + padd_amount)
        y2  = int(np.max(y_coordinates) + padd_amount)
        # Initialize a variable to store the label of the hand.
        label = "Unknown"
        rows,cols,_=output_image.shape
        gap=[x2-x1,y2-y1]
        Max=max(gap)
        x1=int(x1+(gap[0]-Max)/2)
        y1=int(y1+(gap[1]-Max)/2)
        x2=int(x2-(gap[0]-Max)/2)
        y2=int(y2-(gap[1]-Max)/2)
        bool1=x1>0 and y1>0 and x2 <cols and y2 <rows
        if draw and bool1: 
            # Draw the bounding box around the hand on the output image.
            camera.rectangle(output_image, (x1, y1), (x2, y2), (0,255,0),6, camera.LINE_8)
            camera.rectangle(output_image, (x1, y1-40), (x2, y1), (0,255,0),-1, camera.LINE_8)
    return output_image,[x1,x2,y1,y2,Max],bool1


# function to detect letter in image
def detection(image,d,camera):
    global word
    img_file = image.copy()[d[2]:d[3],d[0]:d[1]]
    img_file = skimage.transform.resize(img_file, (64, 64, 3))
    img_arr = np.asarray(img_file).reshape((64, 64, 3))
    
    #using model and predicting letter in image
    predictions =np.argmax(model.predict(np.array([img_arr])),axis=1)
    camera.putText(image,classes[predictions[0]], (d[0]+20, d[2]-2), camera.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 2,camera.LINE_4,)
    return classes[predictions[0]]
   

hands_video = mp_hands.Hands(static_image_mode=False, max_num_hands=1,
                             min_detection_confidence=0.5, min_tracking_confidence=0.5)

# calling above functions and return the last image                             
def findLetters(camera,frame):
    letter=""
    frame = camera.flip(frame, 1)
    frame, results = detectHandsLandmarks(frame, hands_video,camera)
    if results.multi_hand_landmarks:
        frame,dimentions,bool1 = drawBoundingBoxes(frame, results,camera)
        if bool1:
            letter=detection(frame,dimentions,camera)
    return [frame,letter]

