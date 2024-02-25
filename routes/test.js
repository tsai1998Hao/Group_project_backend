//完全自己來的!!!!!!
//完全自己來的!!!!!!




import express from "express";
import db from "./../utils/connect-mysql.js";

const router =express.Router();
router.get("/", async (req, res)=>{
    const sql ="SELECT * FROM forum_article_1223 ORDER BY justnumber DESC LIMIT 5";
    const [rows] =await db.query(sql);
    console.log(rows);
    res.json(rows);
});

export default router;
//完全自己來的!!!!!!
//完全自己來的!!!!!!
//完全自己來的!!!!!!
//完全自己來的!!!!!!
//完全自己來的!!!!!!






