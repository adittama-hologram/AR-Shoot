---
name: Game Dev Skill
description: Helps with Game Development on web task.
---

# Web Dev
This game is web based so please also follow the WebDev-Skill

The main concept of this game is AR shooter game. when player spawned there will be 10 icons that scattered around player. player then can aim their camera and then tap these icons to collected it. 

### AR Standard
**IMPORTANT**: All AR development MUST use the **WebXR Device API**. Do not use legacy `DeviceOrientation` or camera feed overlays for professional AR stability. Use `THREE.WebXRManager` for session handling.

# Start of the Game
Before the game started player is instructed to input their name, this name will then recorded later for the Leaderboard. after the player enter their name they can press the "start" button to start the game

# How To Play Panel
Before the game started but after player enter their name, how to play popup will be shown. this consist of instruction about how to play the game.

# Timer
Game time is limited to 120 second, if the player manages to collect all 10 icons before the time runs out, the player will win and the game will end.

# End Game Popup
When the game is finished, pop up will appear. this popup show the player the player time if they win. Retry button is on the bottom of this popup for the player to play again. next to the retry button there is leaderboard button, this button will show a leaderboard popup

# Leaderboard
Leaderboard score is stored in database, this leaderboard is record the player name and player score. The Leaderboard popup will show this score for the 20 Best.

# Icons
There are 10 icons in which player can collect by tapping on it. these icon must be unique to eachother. Make the icons looklike a fast food and baverages company icon.

# Control
The game uses **WebXR** to track the player's real-world position and orientation. Aiming is done by moving the device in 3D space. Interaction (shooting/collecting) is handled via WebXR controller select events (screen taps).

# Design
- the game design is colorfull, using purple and white as their main color.
- add sfx everytime the icons is being collected.
- add sfx everytime ui button is clicked
- add sfx when the game is ended.
- add simple looped bgm when the game is playing