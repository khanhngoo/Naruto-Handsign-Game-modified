import os
from ultralytics import YOLO
import cv2
import argparse
import torch
import pandas as pd

def arg():
    parser = argparse.ArgumentParser(description="test best model")
    parser.add_argument("--data", type=str, required=True, help="link to data yaml")
    parser.add_argument("--weight", type=str, default=r"C:\Users\Administrator\Desktop\Track-CV---Naruto-Handsign-Challenge\Gesture_recognition\YOLO\runs\train\exp1\weights\best.pt", help="link to data best model")
    parser.add_argument("--testdir", type=str, default=r"C:\Users\Administrator\Desktop\Track-CV---Naruto-Handsign-Challenge\Gesture_recognition\dataset\test\images", help="link to test dataset")
    parser.add_argument("--savedirt", type=str, default=r"C:\Users\Administrator\Desktop\Track-CV---Naruto-Handsign-Challenge\Gesture_recognition\test_best_model\test_w_test_data\test_result", help="link to save test result")
    return parser.parse_args()

args = arg()
os.makedirs(args.savedirt, exist_ok=True)

if torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")
model = YOLO(args.weight).to(device)

result = model.val(data = args.data)

csv_path = os.path.join(args.savedirt, 'test_results.csv')
df = pd.DataFrame({
    'Metric': ['Precision', 'Recall', 'mAP50', 'mAP50-95'],
    'Value': [result.box.p, result.box.r, result.box.map50, result.box.map]
})
df.to_csv(csv_path, index=False)


list_img = [os.path.join(args.testdir, pic) for pic in os.listdir(args.testdir)]

for ind, path in enumerate(list_img):
    res = model.predict(path)
    anno = res[0].plot()
    save_path = os.path.join(args.savedirt, f"predicted_image_{ind+1}.jpg")
    cv2.imwrite(save_path, anno)
    
    print(f"Ảnh predicted đã lưu tại: {save_path}")