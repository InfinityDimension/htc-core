/*
  DESCRIPTION: Counts transactions from trs_list

  PARAMETERS: None
*/

SELECT count(*)
FROM trs_list
${conditions:raw}
