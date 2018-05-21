


/*
  DESCRIPTION: Add constraints to improve upserts.

  PARAMETERS: None
*/

ALTER TABLE "peers"
  ADD CONSTRAINT "address_unique" UNIQUE
  USING INDEX "peers_unique";
