When a minion dies, we should process all process minion death effects, which includes all reborn:

    - this means that when a minion dies, it should be put in a more global "pending minion death" queue, and when we do process the minions death we process all pending triggers
    - today, if we have a golden Twilight Hatchling that spawns 2 "attack immediately" minions, the chain of actions is:
        - Hatchling attacks and kills an opposing reborn minion and dies in the process
        - minion death is processed, and processes first the hatchling deathrattle
            - the first whelp spawns and attacks immediately, and kills an enemy minion
            - the second when spawns and attacks immediately, and kills an enemy minion
        - we go back to the initial minion death, and the reborn is processed, and spawns an enemy minion
    - what is SHOULD be:
        - Hatchling attacks and kills an opposing reborn minion and dies in the process
        - minion death is processed, and processes first the hatchling deathrattle
            - the first whelp spawns and attacks immediately, and kills an enemy minion
            - minion death is processed
                - the pending "reborn" is processed
            - the second when spawns and attacks immediately, and kills an enemy minion
        - we go back to the initial minion death, and there is nothing left to process
    -  https://replays.firestoneapp.com/?debug=true&reviewId=08bea042-e225-4b16-b84e-739c873dd481&turn=7&action=0
    - intertwined_death_loops.08bea042-e225-4b16-b84e-739c873dd481.json
