


/*
  DESCRIPTION: Change the version column in the peers table so that it can accept longer version strings like x.x.x-alpha.x
  PARAMETERS: None
*/

ALTER TABLE "peers"
  ALTER COLUMN "version" TYPE VARCHAR(64);
