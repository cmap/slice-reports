
const configs = require("./config.json")
//The old project prefix
const OLD_PROJECT_DIR = configs.PARENT_SRC_PROJECT_DIR.toUpperCase();
//The directory to host the source files
const SOURCE_DIR = configs.PARENT_SRC_PROJECT_DIR  +  '/' + OLD_PROJECT_DIR;

//The new project prefix
const NEW_PROJECT_DIR = configs.PARENT_DEST_PROJECT_DIR.toUpperCase();
//The directory that would host the processed files
const DESTINATION_DIR = configs.PARENT_DEST_PROJECT_DIR + '/' + NEW_PROJECT_DIR;


//pert-inames that should be retained
const PERT_INAMES = configs.PERT_INAMES;

//The pert ids that should be retained
const PERT_IDS = configs.PERT_IDS;

//The pert plates that should be retained
const PERT_PLATES = configs.PERT_PLATES;


//The directory to host the source files
const SOURCE_DATA_DIR = SOURCE_DIR + '/data';

//The directory that would host the processed files
const DESTINATION_DATA_DIR = DESTINATION_DIR + '/data';

//The old project prefix
const OLD_PROJECT_PREFIX = OLD_PROJECT_DIR + "_";

//The new project prefix
const NEW_PROJECT_PREFIX = NEW_PROJECT_DIR + "_";

const g = PERT_INAMES.join("|");
const PERT_INAMES_REG_EXP = new RegExp(g);

/**
 * Rows with pert_ids in this project are retained
 * @type {string[]}
 */
const ROW_FILES_POST_FIX = [
    '_DRC_TABLE.csv',
    '_LEVEL3_LMFI_*.csv',
    '_LEVEL4_LFC_COMBAT_*.csv',
    '_LEVEL4_LFC_n*.csv',
    '_LEVEL5_LFC_COMBAT_*.csv',
    '_LEVEL5_LFC_n*.csv',
    '_RF_table.csv',
    '_continuous_associations.csv',
    '_discrete_associations.csv',
    '_model_table.csv',
    '_inst_info.txt'
];

/**
 * Rows with pert plates in this project are retained
 * @type {string[]}
 */
const PLATE_FILES_POST_FIX = [
    '_LEVEL2*.csv',
    '_QC_TABLE.csv'
];
/**
 * Files to copy from source to destination
 * @type {string[]}
 */
const COPY_FILES_POST_FIX = [
    '_cell_info.txt'
];
/**
 * Columns with pert-ids not part of this project are removed from these files
 * @type {string[]}
 */
const COLUMN_FILES_POST_FIX = [
    '_IC50_MATRIX.csv',
    '_LFC_MATRIX.csv',
    '_AUC_MATRIX.csv'
];
/**
 * Destination files to zip
 * @type {string[]}
 */
const FILES_TO_ZIP = [
    '_AUC_MATRIX.csv',
    '_continuous_associations.csv',
    '_discrete_associations.csv',
    '_DRC_TABLE.csv',
    '_IC50_MATRIX.csv',
    '_LEVEL3_LMFI_*.csv',
    '_LEVEL4_LFC_COMBAT_*.csv',
    '_LEVEL5_LFC_COMBAT_*.csv',
    '_LFC_MATRIX.csv',
    '_model_table.csv',
    '_RF_table.csv',
    '_QC_TABLE.csv'
];

function matcher(input) {
    return PERT_INAMES_REG_EXP.test(input);
}


module.exports = {
    COLUMN_FILES_POST_FIX: COLUMN_FILES_POST_FIX,
    ROW_FILES_POST_FIX: ROW_FILES_POST_FIX,
    matcher: matcher,
    NEW_PROJECT_PREFIX: NEW_PROJECT_PREFIX,
    OLD_PROJECT_PREFIX: OLD_PROJECT_PREFIX,
    SOURCE_DATA_DIR: SOURCE_DATA_DIR,
    DESTINATION_DATA_DIR: DESTINATION_DATA_DIR,
    PERT_IDS: PERT_IDS,
    PERT_PLATES: PERT_PLATES,
    PLATE_FILES_POST_FIX: PLATE_FILES_POST_FIX,
    COPY_FILES_POST_FIX: COPY_FILES_POST_FIX,
    FILES_TO_ZIP: FILES_TO_ZIP,
    DESTINATION_DIR: DESTINATION_DIR,
    SOURCE_DIR: SOURCE_DIR,
    OLD_PROJECT_DIR: OLD_PROJECT_DIR,
    NEW_PROJECT_DIR: NEW_PROJECT_DIR
};
