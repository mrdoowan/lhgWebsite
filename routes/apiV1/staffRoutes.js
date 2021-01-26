const router = require('express').Router();
const handler = require('./dependencies/handlers');

/*  Import helper Data function modules */
import { putNewStaff } from '../../functions/apiV1/staffData';

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
router.put('/add', (req, res) => {
    putNewStaff(req.body).then((response) => {
        return res.status(200).json(response);
    }).catch((err) => handler.error500s(err, res, "PUT Profile Add Staff Error."));
});

/**
 * @route   PUT api/staff/v1/update
 * @desc    Add new staff/mod by altering Profile
 * @access  Private to that User who is a Mod/Staff only
 */
router.put('/update', (req, res) => {

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
router.put('/remove', (req, res) => {

});

//#endregion

module.exports = router;