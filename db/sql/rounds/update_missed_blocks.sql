


/*
  DESCRIPTION: ?

  PARAMETERS:
    - change - can be either '+ 1' or '- 1'
    - outsiders - array of something?
*/

UPDATE mem_accounts
SET "missedBlocks" = "missedBlocks" ${change:raw}
WHERE address IN (${outsiders:csv})
