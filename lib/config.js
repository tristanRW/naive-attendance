// Do not change these configurations after the blockchain is initialized
module.exports = {
  // INFO: The mining reward could decreases over time like bitcoin. See https://en.bitcoin.it/wiki/Mining#Reward.
  MINING_REWARD: 5000000000,
  // INFO: Usually it's a fee over transaction size (not quantity)
  FEE_PER_TRANSACTION: 0,
  // INFO: Usually the limit is determined by block size (not quantity)
  TRANSACTIONS_PER_BLOCK: 2,

  DIFFICULTY_EASE: 2,

  genesisBlock: {
    index: 0,
    previousHash: "0",
    timestamp: 1465154705,
    nonce: 0,
    transactions: [
      {
        id: "63ec3ac02f822450039df13ddf7c3c0f19bab4acd4dc928c62fcd78d5ebc6dba",
        hash: null,
        type: "regular",
        data: {
          inputs: [],
          outputs: [],
        },
      },
    ],
    difficulty: 30000, //this seems reasonable for my laptop
  },
  pow: {
    getDifficulty: (blocks, index) => {
      // Proof-of-work difficulty settings
      //const BASE_DIFFICULTY = Number.MAX_SAFE_INTEGER;
      //const EVERY_X_BLOCKS = 5;
      //const POW_CURVE = 5;

      //one block every 10 seconds
      const BLOCK_TIME_TARGET = 10;
      //adjust difficulty every X blocks ~ 1 min
      const DIFFICULTY_ADJUSTMENT_INTERVAL = 6;
      //console.info(
      //  `calculating difficulty for blockchain: ${JSON.stringify(blocks)} at index: ${index}`,
      //);
      //is it time?
      if (index % DIFFICULTY_ADJUSTMENT_INTERVAL != 0) {
        return blocks[index - 1].difficulty; //return difficulty of last block
      }
      //enough blocks to adjust?
      if (blocks.length <= DIFFICULTY_ADJUSTMENT_INTERVAL) {
        console.log("not enough blocks to adjust difficulty");
        return blocks[index - 1].difficulty; //return difficulty of last block
      }

      //we are at adjustment block & chain is long enough
      //get last adjustment block & time taken and expected
      const lastAdjustmentBlock =
        blocks[index - DIFFICULTY_ADJUSTMENT_INTERVAL];
      const timeSinceLastAdjustmentTaken = Math.max(
        1,
        blocks[index - 1].timestamp - lastAdjustmentBlock.timestamp,
      );
      console.info(
        `Difficulty adjustment!\nTime taken: ${timeSinceLastAdjustmentTaken}`,
      );
      const timeSinceLastAdjustmentExpected =
        BLOCK_TIME_TARGET * DIFFICULTY_ADJUSTMENT_INTERVAL;
      console.info(`Time expected: ${timeSinceLastAdjustmentExpected}`);
      //set new difficulty
      let newDifficulty = Math.max(
        blocks[index - 1].difficulty *
          (timeSinceLastAdjustmentTaken / timeSinceLastAdjustmentExpected),
        6000000000, //max difficulty such that my laptop can mine it reasonably for testing and demonstration
      );
      /*
       *due to how difficulty calculation works in naivecoin:
       * increase difficulty value to make it easier,
       * decrease difficulty value to make it harder
       */
      console.info(
        `difficulty | old: ${blocks[index - 1].difficulty} new: ${newDifficulty}`,
      );
      return newDifficulty;
    },
  },
};
