const express=require("express");
const { exeregister, loginExe,  logoutexe, loginStatusexe } = require("../controllers/exeController");
const protectexe = require("../middleWare2/authMiddleware1");
const router=express.Router();

router.post('/exeregister', exeregister);
router.post('/loginexe', loginExe)
router.get('/logout', logoutexe)
router.get('/logedinexe', loginStatusexe)


module.exports=router;