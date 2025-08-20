# -Track-CV---Naruto-Handsign-Challenge

## 📖 Overview
Ninja Battle is a two-player interactive game inspired by Naruto.  
Players use real-time gesture recognition and AI style transfer to:  
- Create unique avatars from their webcam images  
- Perform hand sign sequences to cast ninja techniques (“jutsu”)  
- Compete in turn-based battles until one player is defeated  

No controller needed — just a webcam, your hands, and your ninja skills.  

## ⚙️ Setup
- Requirements:  
  - A large display screen  
  - One or two webcams  
  - Two players  
- Steps:  
  1. Each player takes a facial snapshot via webcam  
  2. An AI style transfer model (e.g., CycleGAN or similar) applies an artistic style (abstract, combat, sketch, etc.)  
  3. A personalized avatar for each player is displayed on screen  

## 📝 Preparation Phase
- Players receive a hand sign reference sheet, mapping gestures to specific jutsu.  
- Jutsu are ranked by difficulty:  
  - Easy jutsu → short/simple sequences → low damage  
  - Hard jutsu → long/complex sequences → high damage  

## ⚔️ Battle Phase
- The match is turn-based:  
  - Each turn lasts up to 1 minute  
  - The active player performs a hand sign sequence in front of the webcam  
- AI gesture recognition analyzes the sequence in real time:  
  - Success:  
    - A short jutsu animation (3–4 seconds) is played  
    - Opponent’s HP bar decreases  
  - Failure:  
    - No effect  
    - Turn passes to the opponent  

## 🏆 Win Condition
- The game ends when one player’s HP reaches zero  
- The last ninja standing wins the battle  

## 🛠 Tech Stack
- Computer Vision: Gesture recognition (hand sign detection)  
- AI Models: Arbitrary style transfer (CycleGAN, etc.)  
- Graphics & Multimedia: Avatar rendering, animations, HP visualization  
- Hardware: Webcam(s), display screen  
