


/*
  DESCRIPTION: Add Broadhash Column to Peers.

  PARAMETERS: None
*/

ALTER TABLE "peers" ADD COLUMN "broadhash" bytea;

CREATE INDEX IF NOT EXISTS "peers_broadhash" ON "peers"("broadhash");
