# Mini-Game Hub

**GAME_NEWEST** is a collection of seven browser games built with **JavaScript, HTML, and CSS**, organized behind a shared game-selection hub.

[**Play the games ↗**](https://v-exor.github.io/GAME_NEWEST/) · [Developer profile](https://github.com/v-Exor)

## Games

| Game | Highlights |
| :--- | :--- |
| Tic Tac Toe | Local two-player and computer-opponent modes, turn handling, and win/draw detection |
| Memory Match | Difficulty options, card matching, and saved best times |
| Connect Four | Board-based gameplay and a computer opponent |
| Jumping Capybara | Obstacle avoidance, collision detection, and a saved best score |
| Snake | Keyboard controls, food collection, score tracking, and a saved best score |
| Checkers | Legal moves, captures, and computer-opponent difficulty options |
| Rock, Paper, Scissors | Player versus computer rounds and score tracking |

Best scores and times use browser `localStorage`; they are specific to the current browser and can be removed by clearing site data.

## Run locally

Clone this repository and serve its directory with a static web server, for example:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/` and choose a game. No package installation or build step is required.

## Code organization

- `index.html` contains the shared game hub.
- `style.css` provides shared styling.
- `games/` contains individual game pages, their JavaScript logic, and assets.

The collection explores event-driven programming, game state, computer-opponent logic, animation loops, and browser persistence.
