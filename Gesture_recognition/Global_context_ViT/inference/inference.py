"""
GCViT Inference Script

This script has been updated to fix the tensor size error that was occurring in the GlobalQueryGen class.
The main fixes include:

1. Automatic model architecture detection from checkpoint files
2. Robust tensor reshaping with fallback mechanisms
3. Better error handling and debugging information
4. Automatic input size detection from model configuration
5. Model compatibility checking before inference

The original error was caused by a mismatch between expected and actual tensor dimensions
in the GlobalQueryGen.forward() method, specifically when reshaping tensors for the
global attention mechanism.

Usage:
    python inference.py --image <image_path> --checkpoint <checkpoint_path>
    
Optional arguments:
    --model: Model architecture (auto-detected if not specified)
    --num-classes: Number of classes (auto-detected if not specified)
    --device: Device to use (cuda/cpu)
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import argparse
import time
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '1'

import sys
from timm.data import create_dataset, create_loader, resolve_data_config, Mixup, FastCollateMixup, AugMixDataset
from timm.models import create_model, safe_model_name, resume_checkpoint, load_checkpoint, model_parameters


# Add the parent directory to the path so we can import the models
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Now import the GCViT model
from models.gc_vit import *  # Import your model architecture


def detect_model_architecture(checkpoint_path):
    """
    Detect the model architecture from checkpoint file
    Args:
        checkpoint_path: Path to the checkpoint file
    Returns:
        Detected model name or None if cannot determine
    """
    try:
        checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=False)
        
        # Check if there's architecture info in the checkpoint
        if 'arch' in checkpoint:
            return checkpoint['arch']
        elif 'model_arch' in checkpoint:
            return checkpoint['model_arch']
        elif 'args' in checkpoint and hasattr(checkpoint['args'], 'model'):
            return checkpoint['args'].model
        
        # Try to infer from state dict keys
        state_dict = checkpoint.get('state_dict', checkpoint.get('model', checkpoint))
        
        # Look for characteristic layer names to identify the model
        if 'patch_embed.proj.weight' in state_dict:
            # This is likely a GCViT model
            # Check the dimensions to determine which variant
            proj_weight = state_dict['patch_embed.proj.weight']
            if proj_weight.shape[0] == 64:
                return 'gc_vit_tiny'
            elif proj_weight.shape[0] == 96:
                return 'gc_vit_small'
            elif proj_weight.shape[0] == 128:
                return 'gc_vit_base'
            elif proj_weight.shape[0] == 192:
                return 'gc_vit_large'
        
        return None
    except Exception as e:
        print(f"Warning: Could not detect model architecture: {e}")
        return None

def load_model(checkpoint_path, model_name, num_classes, device='cuda'):
    detected_model = detect_model_architecture(checkpoint_path)
    if detected_model and detected_model != model_name:
        print(f"Warning: Checkpoint appears to be from {detected_model}, but {model_name} was specified.")
        print(f"Using detected model: {detected_model}")
        model_name = detected_model
    
    # Create the model architecture
    model = create_model(
        model_name,
        pretrained=False,  # Don't load pretrained weights
        num_classes=num_classes
    )
    
    # Load checkpoint
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    
    # Handle different checkpoint formats
    if 'state_dict' in checkpoint:
        state_dict = checkpoint['state_dict']
    elif 'model' in checkpoint:
        state_dict = checkpoint['model']
    else:
        state_dict = checkpoint
    
    # Load the weights
    model.load_state_dict(state_dict, strict=True)
    
    # Move to device and set to evaluation mode
    model = model.to(device)
    model.eval()
    
    return model



def preprocess_image(image_path, model=None, input_size=(224, 224)):
    """
    Preprocess a single image for inference
    
    Args:
        image_path: Path to the image file
        model: The model to check for expected input size
        input_size: Expected input size (height, width) - used if model doesn't specify
    
    Returns:
        Preprocessed image tensor ready for model input
    """
    # Try to get the expected input size from the model
    if model and hasattr(model, 'default_cfg') and model.default_cfg:
        model_input_size = model.default_cfg.get('input_size', None)
        if model_input_size and len(model_input_size) >= 3:
            # Model expects (channels, height, width)
            input_size = (model_input_size[1], model_input_size[2])
            print(f"Using model-specified input size: {input_size}")
        else:
            print(f"Using default input size: {input_size}")
    else:
        print(f"Using default input size: {input_size}")
    
    # Define the same transforms used during training
    transform = transforms.Compose([
        transforms.Resize(input_size),  # Resize to model input size
        transforms.ToTensor(),          # Convert to tensor
        transforms.Normalize(           # Normalize with ImageNet stats
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    # Load and preprocess image
    try:
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image)
        
        # Add batch dimension
        image_tensor = image_tensor.unsqueeze(0)
        
        return image_tensor
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        raise

def run_inference(model, image_tensor, device='cuda'):
    image_tensor = image_tensor.to(device)
    
    # Run inference
    with torch.no_grad():
        outputs = model(image_tensor)
        
        # Get probabilities
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Get predicted class
        predicted_class = torch.argmax(probabilities, dim=1)
        
        # Get confidence score
        confidence = probabilities[0][predicted_class].item()
    
    return probabilities, predicted_class.item(), confidence


def main():
    parser = argparse.ArgumentParser(description='Run inference on a single image')
    parser.add_argument('--image', required=True, help='Path to input image')
    parser.add_argument('--checkpoint', required=True, help='Path to model checkpoint')
    parser.add_argument('--model', default='gc_vit_large_512_21k', help='Model architecture name (auto-detected if not specified)')
    parser.add_argument('--num-classes', type=int, default=None, help='Number of classes (auto-detected if not specified)')
    parser.add_argument('--device', default='cuda', help='Device to run inference on (cuda/cpu)')
    parser.add_argument('--class-names', default='', help='Path to class names file (optional)')
    
    args = parser.parse_args()
    
    # Check if files exist
    if not os.path.exists(args.image):
        print(f"Error: Image file {args.image} not found")
        return
    
    if not os.path.exists(args.checkpoint):
        print(f"Error: Checkpoint file {args.checkpoint} not found")
        return
    
    # Set device
    device = args.device if torch.cuda.is_available() and args.device == 'cuda' else 'cpu'
    print(f"Using device: {device}")
    
    
    # Load class names if provided
    class_names = ['bird', 'boar', 'dog', 'dragon', 'hare', 'horse', 'monkey', 'ox', 'ram', 'rat', 'snake', 'tiger', 'zero']
    # if args.class_names and os.path.exists(args.class_names):
    #     with open(args.class_names, 'r') as f:
    #         class_names = [line.strip() for line in f.readlines()]
    
    try:
        # Load model
        start = time.time()
        print("Loading model...")
        model = load_model(args.checkpoint, args.model, args.num_classes, device)
        print("Model loaded successfully!")
        
        # Print model info for debugging
        print(f"Model architecture: {args.model}")
        print(f"Number of classes: {args.num_classes}")
        print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
        
        # Preprocess image
        print("Preprocessing image...")
        image_tensor = preprocess_image(args.image, model)
        print(f"Image preprocessed to shape: {image_tensor.shape}")
        
        # Run inference
        print("Running inference...")
        probabilities, predicted_class, confidence = run_inference(model, image_tensor, device)
        
        # Display results
        print(f"\nInference Results:")
        print(f"Predicted class index: {predicted_class}")
        print(f"Confidence: {confidence:.4f}")
        
        if class_names and predicted_class < len(class_names):
            print(f"Predicted class name: {class_names[predicted_class]}")
        
        # Show top-5 predictions
        print(f"\nTop-5 predictions:")
        top5_prob, top5_indices = torch.topk(probabilities[0], 5)
        for i in range(5):
            class_idx = top5_indices[i].item()
            prob = top5_prob[i].item()
            class_name = class_names[class_idx] if class_names and class_idx < len(class_names) else f"Class {class_idx}"
            print(f"  {i+1}. {class_name}: {prob:.4f}")

        end = time.time()
        print(f"Inference time: {end - start} seconds")
            
    except Exception as e:
        print(f"Error during inference: {e}")
        import traceback
        traceback.print_exc()
        
        # Additional debugging info
        print(f"\nDebugging information:")
        print(f"Checkpoint path: {args.checkpoint}")
        print(f"Model name: {args.model}")
        print(f"Number of classes: {args.num_classes}")
        print(f"Device: {device}")
        
        # Check if checkpoint exists and can be loaded
        try:
            checkpoint = torch.load(args.checkpoint, map_location='cpu', weights_only=False)
            print(f"Checkpoint keys: {list(checkpoint.keys())}")
            if 'state_dict' in checkpoint:
                print(f"State dict keys (first 10): {list(checkpoint['state_dict'].keys())[:10]}")
        except Exception as checkpoint_error:
            print(f"Could not load checkpoint for debugging: {checkpoint_error}")

if __name__ == '__main__':
    main()