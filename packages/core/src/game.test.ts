describe("roll", () => {
	/*
    rollDice & giveDiceRollToken
    --> moveRunners 
    --> isOnEffectTile (--true--> moveRunners & resolveEffectTileReward) 
    --> isGameEnded || isRoundEnded (
      --true--> resetEffectTiles 
      & resetDices 
      & resolveDiceRollReward[] 
      & (resetRoundBet & resolveRoundBetReward)[] 
      --> (resetPartnership & resolvePartnershipReward)[]
      --> isGameEnded (
        --true--> (resetGameBet & resolveGameBetReward)[]
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
