# Typing Game Incremental

Gameplay:
- Player types words
- There's a timer
- Player finishes a word, sentences, etc. at a certain time limit, gets points
- Points are used for upgrades
    - Longer time limit
    - New words (more points)
    - New punctiation (more points)
    - More flashier
    - Some upgrades would give a little bit more time, when the word is completed
    - Can sometimes buy themes, typing effects, like words are falling

Start timer
→ User types sentence
→ Sentence completed
→ Add points (every sentence completed, and words completed)
→ Generate new sentence
→ Reset input
→ Continue until timer reaches zero

Upgrades
- timer length

in the endgame, or challenge
- Sentence/word length?

Design:
- At the center would be the words
- the bottom or top, would be the timer, the timer is a progress bar from green (100-90) -> orange -> red
- Light or dark mode
- The words would become from gray to light, when typed

2 UI
- typing screen
- incremental tree screen, when bought, it should bring like flashes, shake, etc.

References:
- Monkeytype


Core pieces
- word bank (all possible words)
- Current target words (the words shown to the player)
- Player input
- Checker (compares input against the target)

- Create a word randomizer