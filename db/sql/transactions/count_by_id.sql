/*
  DESCRIPTION: Counts transactions by Id

  PARAMETERS:
      - id: trs id
*/

SELECT count(*)
FROM trs
WHERE id = ${id}
