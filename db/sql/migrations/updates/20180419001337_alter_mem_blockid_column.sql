


/*
  DESCRIPTION: Remove column blockId from tables: mem_accounts and mem_round.
  PARAMETERS: None
*/

ALTER TABLE "mem_accounts" DROP COLUMN "blockId";
ALTER TABLE "mem_round" DROP COLUMN "blockId";
ALTER TABLE IF EXISTS "mem_round_snapshot" DROP COLUMN "blockId";
