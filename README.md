# slice-reports

A module for moving compounds/asssets from project A to project B.


1. Checkout this repository
2. CD into the checked out repos and pull the reports folder from whereever it is hosted. Nake sure you the reports are deposited into the root of the cheched out repos.
3. Edit copy config.json.template as config.json.
4. Edit config.json appropriately 
  * PARENT_SRC_PROJECT_DIR - Should point to the name of the folder holding the reports for example mts001_validation_compounds
  * PARENT_DEST_PROJECT_DIR - This is the name of the destination folder that would hold the sliced reports
  * PERT_INAMES - This is an arry of pert_inames associated with the pert_ids that you want to move
  * PERT_IDS - This is an array of pert ids that you want to slice out of the reports
  * PERT_PLATES - An array of pert plates that the pert_ids are on

5. Then run node slice.js
  This will generate the needed assets into the PARENT_DEST_PROJECT_DIR
6. CD into that folder and edit index.html to keep only the perts that are needed. You may also want to change the title to reflect the new project

7. sync the PARENT_DEST_PROJECT_DIR to the host system


