const staffV1Routes = require('express').Router();

import { error500sServerError } from './dependencies/handlers';
/*  Import helper Data function modules */
import { putNewStaff } from '../../functions/apiV1/staffData';
import { authenticateJWT } from './dependencies/jwtHelper';

/*  
    ----------------------
    Staff/Moderator API Requests
    ----------------------
*/

//#region POST / PUT REQUESTS - Staff

/**
 * @route   PUT api/staff/v1/add
 * @desc    Add new staff/mod by altering Profile
 * @access  Private to Admins
 */
// BODY TEMPLATE:
// {
//     "profile": "NAME",
//     "password": "PASSWORD_HERE",
//     "admin": true,
//     "moderator": true
// }
staffV1Routes.put('/add', authenticateJWT, (req, res) => {
    putNewStaff(req.body).then((response) => {
        return res.status(200).json(response);
    }).catch((err) => error500sServerError(err, res, "PUT Profile Add Staff Error."));
});

/**
 * @route   PUT api/staff/v1/update
 * @desc    Add new staff/mod by altering Profile
 * @access  Private to that User who is a Mod/Staff only
 */
staffV1Routes.put('/update', authenticateJWT, (req, res) => {

});

/**
 * @route   PUT api/staff/v1/remove
 * @desc    Remove staff/mod Powers
 * @access  Private to Admins
 */
// Remove mod/admin powers
// BODY TEMPLATE:
// {
//     "profile": "NAME",
// }
staffV1Routes.put('/remove', authenticateJWT, (req, res) => {

});

//#endregion

export default staffV1Routes;