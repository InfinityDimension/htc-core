


/*
  DESCRIPTION: Drop rewards-related SQL functions and data type.

  PARAMETERS: None
*/

DROP FUNCTION IF EXISTS getBlockRewards();
DROP FUNCTION IF EXISTS calcBlockReward(int);
DROP FUNCTION If EXISTS calcSupply(int);
DROP FUNCTION IF EXISTS calcSupply_test(int, int, bigint);
DROP TYPE IF EXISTS blockRewards;
