it.todo(
	"roll",
	/*
    rollDice & giveDiceRollToken
    --> moveRunners 
    --> isOnEffectTile (--true-->  resolveEffectTileReward --> moveRunners) 
    --> isGameEnded || isRoundEnded (
      --true--> resetEffectTiles 
      & resolveDiceRollReward 
      & resolveRoundBetReward
      --> resolvePartnershipReward
      --> isGameEnded (
        --true--> resolveGameBetReward
        --> endGame
      )
    )
  */
);

it.todo(
	"betRound",
	/*
    betRound
  */
);

it.todo(
	"betGame",
	/*
    betGame
  */
);

it.todo(
	"setEffectTile",
	/*
    setEffectTile
  */
);

it.todo(
	"partnerWith",
	/*
    partnerWith
  */
);
