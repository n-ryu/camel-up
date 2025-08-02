describe("roll", () => {
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
});

describe("betRound", () => {
	/*
    betRound
  */
});

describe("betGame", () => {
	/*
    betGame
  */
});

describe("setEffectTile", () => {
	/*
    setEffectTile
  */
});

describe("partnerWith", () => {
	/*
    partnerWith
  */
});
