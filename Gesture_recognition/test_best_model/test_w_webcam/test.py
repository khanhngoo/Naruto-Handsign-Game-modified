from ultralytics import YOLO
import cv2

model = YOLO(r"Gesture_recognition\YOLO\runs\train\exp1\weights\best.pt")  

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()

    results = model.predict(frame, conf=0.5)  

    annotated_frame = results[0].plot()

    cv2.imshow("YOLO11 Webcam Test", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('s'):
        break


cap.release()
cv2.destroyAllWindows()