


/*
  DESCRIPTION: Change the producedblocks case to producedBlocks

  PARAMETERS: None
*/

ALTER TABLE mem_accounts RENAME COLUMN producedblocks TO "producedBlocks";
ALTER TABLE mem_accounts RENAME COLUMN missedblocks TO "missedBlocks";
