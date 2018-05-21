


/*
  DESCRIPTION: Delete rewards for round from round rewards table.

  PARAMETERS: round - Round for which data will be deleted
*/

DELETE FROM rounds_rewards WHERE round = ${round}
