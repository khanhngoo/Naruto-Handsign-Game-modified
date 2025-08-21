import argparse
from ultralytics import YOLO
import os
import torch
import matplotlib.pyplot as plt
import pandas as pd

def parse_args():
    parser = argparse.ArgumentParser(description="Fine-tune YOLOv11s")
    parser.add_argument("--data", type=str, required=True, help="Path to dataset.yaml")
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs")
    parser.add_argument("--imgsize", type=int, default=640, help="Image size")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    parser.add_argument("--weights", type=str, default="yolo11n.pt", help="Pretrained weights (or checkpoint path)")
    parser.add_argument("--project", type=str, default="runs/finetune", help="Project folder to save runs")
    parser.add_argument("--name", type=str, default="exp", help="Run name")
    parser.add_argument("--resume", action="store_true", help="Resume training from last checkpoint if available")
    parser.add_argument("--hyp", type=str, default=None, help="Path to hyp.yaml for augmentation settings")
    return parser.parse_args()

args = parse_args()

if torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

model = YOLO(args.weights).to(device)

run_dir = os.path.join(args.project, args.name)
if args.resume and os.path.exists(os.path.join(run_dir, "weights", "last.pt")):
    args.weights = os.path.join(run_dir, "weights", "last.pt")


results = model.train(
    data=args.data,
    epochs=args.epochs,
    imgsz=args.imgsize,
    batch=args.batch,
    project=args.project,
    name=args.name,
    save=True,
    save_period=1
)

csv_path = os.path.join(results.save_dir, 'results.csv')
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)

    print("\n📊 Training Summary:")
    print(df.tail(1)) 

    plt.figure(figsize=(10, 6))
    plt.plot(df['epoch'], df['train/box_loss'], label="Box Loss")
    plt.plot(df['epoch'], df['train/cls_loss'], label="Class Loss")
    plt.plot(df['epoch'], df['train/dfl_loss'], label="DFL Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training Losses")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(results.save_dir, "loss_plot.png"))
    plt.close()

    plt.figure(figsize=(10, 6))
    plt.plot(df['epoch'], df['metrics/precision(B)'], label="Precision")
    plt.plot(df['epoch'], df['metrics/recall(B)'], label="Recall")
    plt.plot(df['epoch'], df['metrics/mAP50(B)'], label="mAP50")
    plt.plot(df['epoch'], df['metrics/mAP50-95(B)'], label="mAP50-95")
    plt.xlabel("Epoch")
    plt.ylabel("Metrics")
    plt.title("Validation Metrics")
    plt.legend()
    plt.grid(True)
    plt.savefig(os.path.join(results.save_dir, "metrics_plot.png"))
    plt.close()
else:
    print("Could not find results.csv to plot metrics.")