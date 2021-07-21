const serviceV1Routes = require('express').Router();

import {
  res200sOK,
  error500sServerError,
} from './dependencies/handlers';
/*  Import helper Data function modules */
import {
  getChampIds,
  getSummonerSpellIds,
  getVersions
} from '../../services/miscDynamoDb';

/*  
    ----------------------
    Service API Requests
    ----------------------
*/

//#region GET Requests - Service

/**
 * @route   GET api/service/v1/champs
 * @desc    Get ChampIds from DynamoDb
 * @access  Public
 */
 serviceV1Routes.get('/champs', (req, res) => {
  getChampIds().then((data) => {
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Service ChampIds Error."));
});

/**
 * @route   GET api/service/v1/spells
 * @desc    Get SpellIds from DynamoDb
 * @access  Public
 */
 serviceV1Routes.get('/spells', (req, res) => {
  getSummonerSpellIds().then((data) => {
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Service SpellIds Error."));
});

/**
 * @route   GET api/service/v1/versions
 * @desc    Get Versions List from DynamoDb
 * @access  Public
 */
 serviceV1Routes.get('/versions', (req, res) => {
  getVersions().then((data) => {
    return res200sOK(res, req, data);
  }).catch((err) => error500sServerError(err, res, "GET Service Versions Error."));
});

//#endregion

export default serviceV1Routes;