//這裡是路由，sql語法

//路由的基本架構
import express from "express"
import db from "../utils/connect-mysql.js";
import upload from "../utils/upload-imgs.js";
import dayjs from "dayjs";
const router= express.Router();
//路由的基本架構





router.get("/add", async(req, res)=>{
    res.render('forum-address/add');
});









//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數
const getListData =async(req)=>{
    console.log(req.query.page,req.query.keyword);
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} ORDER BY article_release_date DESC
    LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};

    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api", async(req, res)=>{
    res.json(await getListData(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數







//熱門文章
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData2 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} ORDER BY article_like_num DESC
    LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};

    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData2(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api2", async(req, res)=>{
    res.json(await getListData2(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//熱門文章





//毛孩小毛病-最新
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData3 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="毛孩小毛病"  ORDER BY article_release_date DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData3(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api3", async(req, res)=>{
    res.json(await getListData3(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//毛孩小毛病-最新







//毛孩小毛病-熱門
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData4 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="毛孩小毛病"  ORDER BY article_like_num DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData4(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api4", async(req, res)=>{
    res.json(await getListData4(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//毛孩小毛病-熱門



//可愛貓狗-最新
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData5 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="可愛貓狗"  ORDER BY article_release_date DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData5(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api5", async(req, res)=>{
    res.json(await getListData5(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//可愛貓狗-最新





//可愛貓狗-熱門
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData6 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="可愛貓狗"  ORDER BY article_like_num DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData6(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api6", async(req, res)=>{
    res.json(await getListData6(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//可愛貓狗-熱門





//浪你喜翻我-最新
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData7 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="浪你喜翻我"  ORDER BY article_release_date DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData7(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api7", async(req, res)=>{
    res.json(await getListData7(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//浪你喜翻我-最新





//浪你喜翻我-熱門
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData8 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="浪你喜翻我"  ORDER BY article_like_num DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData8(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api8", async(req, res)=>{
    res.json(await getListData8(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//浪你喜翻我-熱門






//喵汪生活-最新
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData9 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="喵汪生活"  ORDER BY article_release_date DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData9(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api9", async(req, res)=>{
    res.json(await getListData9(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//喵汪生活-最新




//喵汪生活-熱門
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
const getListData10 =async(req)=>{
    const perPage=5;//每頁有幾筆
    let page= +req.query.page || 1;

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
    let keyword= (req.query.keyword && typeof req.query.keyword === 'string' ) ? req.query.keyword.trim() : '';
    let keyword_=db.escape(`%${keyword}%`);

    let qs ={};

//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期
    let startDate= req.query.startDate ? req.query.startDate.trim() : '';
    const startDateD=dayjs(startDate);
    if(startDateD.isValid()){
        startDate=startDateD.format('YYYY-MM-DD');
    } else{
        startDate='';
    }
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢p1 起始日期


//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期
let endDate= req.query.endDate ? req.query.endDate.trim() : '';
const endDateD=dayjs(endDate);
if(endDateD.isValid()){
    endDate=endDateD.format('YYYY-MM-DD');
} else{
    endDate='';
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束的日期



//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢
    let where = `WHERE 1 `;//一定要有空白
    if (keyword){
        qs.keyword=keyword;
        where +=` AND (\`article_content\` LIKE ${keyword_} OR \`article_title_name\` LIKE ${keyword_} ) `;
    }
//多重查詢//多重查詢//多重查詢//多重查詢//多重查詢


//日期範圍查詢//日期範圍查詢//日期範圍查詢p2
if(startDate){
    qs.startDate= startDate;
    where += ` AND article_release_date >='${startDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢p2

//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間
if(endDate){
    qs.endDate= endDate;
    where += ` AND article_release_date <='${endDate}' `;
}
//日期範圍查詢//日期範圍查詢//日期範圍查詢 結束時間

//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢//關鍵字查詢
let totalRows =0;
    let totalPages =0;
    let rows=[];
    let output={
        success: false,
        page,
        perPage,
        rows,
        totalRows,
        totalPages,
        qs,
        redirect:"",
        info:"",
    };





//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數
if(page<1){
        output.redirect = `?page=1`;
        output.info=`頁碼小於1`;
        return output;
    //方法一    return res.redirect(req.baseUrl);
    /*方法二   return res.redirect(`?page=1`);*/
    }
    const t_sql=`SELECT COUNT(1) totalRows From forum_article ${where}`;//${where} 是關鍵字查詢的
    [[{totalRows}]] =await db.query(t_sql);
    totalPages=Math.ceil(totalRows/perPage);

    if(totalRows>0){
        if(page>totalPages){
            output.redirect = `?page=${totalPages}`;
            output.info=`頁碼大於總頁數`;
            return {...output, totalRows, totalPages};
            // return res.redirect(`?page=${totalPages}`);
        }
//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數//如果有人手濺把頁數打負數


// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示
    const sql=`SELECT * From forum_article ${where} AND article_boardcategory_name="喵汪生活"  ORDER BY article_like_num DESC LIMIT ${(page - 1)* perPage}, ${perPage}`;//${where} 是關鍵字查詢的
    [rows] = await db.query(sql);
    output={... output, success: true, rows, totalRows, totalPages};
    }
return output;
// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示// 資料顯示

/*
 const sql ="SELECT * FROM forum_article ORDER BY article_id ASC LIMIT 5"
 const [rows] = await db.query(sql);
 res.json(rows);
 */
}

router.get("/", async (req, res)=>{
    res.locals.pageName="ab-list";
       const output = await getListData10(req);
    if(output.redirect){
        return res.redirect(output.redirect);
    }
    res.render("forum-address/list", output);
});

router.get("/api10", async(req, res)=>{
    res.json(await getListData10(req));
});
//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數//應該是顯示頁數222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222
//喵汪生活-熱門




















































//顯示我的文章
//留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言

router.get("/somebody_creation", async(req, res)=>{
    const article_member_id=req.params.article_member_id;
    const sql = `SELECT * FROM forum_article WHERE article_member_id=777 ORDER BY article_release_date DESC`;
    
    const [rows]= await db.query(sql, [article_member_id]);
    console.log(rows)
    if(!rows.length){
        return res.redirect(req.baseUrl);
    }
    const row =rows[0];
    res.render("forum-address/somebody_creation",{rows});
});


router.get("/api/somebody_creation", async(req, res)=>{
    const article_member_id=req.params.article_member_id;
    const sql = `SELECT * FROM forum_article WHERE article_member_id=777 ORDER BY article_release_date DESC`;
    const [rows]= await db.query(sql, [article_member_id]);

    if(!rows.length){
        return res.json({success: false,rows:[]});
    }
    const row =rows[0];

    res.json({success: true, rows});
});
//留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言
//顯示我的文章





































//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章

router.post("/add", upload.none(), async (req, res) => {

    const{ article_id, article_member_id, article_boardcategory_name,article_title_name,article_content,article_release_date,article_update_date,article_like_num,article_comment_num,pic}=req.body;


    const sql="INSERT INTO `forum_article` SET ?";
    req.body.article_release_date =new Date();
    req.body.article_member_id ="777";
    req.body.article_member_name ="LittleHao";
    const [result]= await db.query(sql,[req.body]);

    res.json(result);

});

//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章//新增文章



//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言

router.post("/add2", upload.none(), async (req, res) => {

    const{ 
        comment_id, member_id, article_id, comment_date, comment_content
        }=req.body;


    const sql="INSERT INTO `forum_comment` SET ?";
    req.body.comment_date =new Date();
    req.body.comment_id =777;
    const [result]= await db.query(sql,[req.body]);

    res.json(result);

});

//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言//新增留言








//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料
router.get("/detail/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    res.locals.title="詳細|"+ res.locals.title;
    const sql = `SELECT * FROM forum_article WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.redirect(req.baseUrl);
    }
    const row =rows[0];
    res.render("forum-address/detail",rows[0]);
});


router.get("/api/detail/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    const sql = `SELECT * FROM forum_article WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.json({success: false});
    }
    const row =rows[0];
    // row.birthday
    // 我沒有生日的欄位
    res.json({success: true, row});
});

//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料//自己嘗試檢視資料



//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數

router.get("/count_comment/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    res.locals.title="詳細|"+ res.locals.title;
    const sql = `SELECT COUNT(*)  FROM forum_comment WHERE article_id= ?`;

    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.redirect(req.baseUrl);
    }
    const row =rows[0];
    res.render("forum-address/count_comment",rows[0]);
});


router.get("/api/count_comment/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    const sql = `SELECT COUNT(*) count FROM forum_comment WHERE article_id= ?`;
    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.json({success: false});
    }
    const row =rows[0];
    // row.birthday
    // 我沒有生日的欄位
    res.json({success: true, row});
});

//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數//檢視留言數






//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料

router.get("/edit/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    res.locals.title="編輯|"+ res.locals.title;
    const sql = `SELECT * FROM forum_article WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.redirect(req.baseUrl);
    }
    const row =rows[0];
    // row.birthday
    // 我沒有生日的欄位
    res.render("forum-address/edit",rows[0]);
});

//12/20 前端資料編輯 又在來一次
//取得單筆資料
router.get("/api/edit/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    const sql = `SELECT * FROM forum_article WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);
    if(!rows.length){
        return res.json({success: false});
    }
    const row =rows[0];
    // row.birthday
    // 我沒有生日的欄位
    res.json({success: true, row});
});
//取得單筆資料
//12/20 前端資料編輯 又在來一次



router.put("/edit/:article_id", async(req, res)=>{
    const output ={
        success:false,
        postData: req.body,
        result: null,
    };
    
    // 怎麼加了就不能動了
    // req.body.address=req.body.address.trim();//去除頭尾空白
    // 怎麼加了就不能動了
    const sql=`UPDATE forum_article SET? WHERE article_id=?`;
    const [result] =await db.query(sql, [req.body, req.body.article_id]);
    output.result = result;
    output.success=!! result.changedRows;
    res.json(output);
});
//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料//編輯資料

















//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料

    router.delete("/:article_id", async(req, res)=>{
        const output ={
            success: false,
            result: null,
        };
        const article_id = +req.params.article_id;
        if( !article_id || article_id<1 ){
            return res.json(output);
        }
        const sql =`DELETE FROM forum_article WHERE article_id=${article_id}`;
        const[result] =await db.query(sql);
        output.result =result;
        output.success =!! result.affectedRows;
        res.json(output);
       
    });

//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料//刪除資料
























//留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言
// router.get("/detail_comment/:comment_id", async(req, res)=>{
//     const comment_id=req.params.comment_id;
//     const sql = `SELECT * FROM forum_comment WHERE comment_id=?`;
//     const [rows]= await db.query(sql, [comment_id]);
//     if(!rows.length){
//         return res.redirect(req.baseUrl);
//     }
//     const row =rows[0];
//     res.render("forum-address/detail_comment",rows[0]);
// });
router.get("/detail_comment/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    const sql = `SELECT * FROM forum_comment WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);
    console.log(rows)
    if(!rows.length){
        return res.redirect(req.baseUrl);
    }
    const row =rows[0];
    res.render("forum-address/detail_comment",{rows});
});


router.get("/api/detail_comment/:article_id", async(req, res)=>{
    const article_id=req.params.article_id;
    const sql = `SELECT * FROM forum_comment WHERE article_id=?`;
    const [rows]= await db.query(sql, [article_id]);

    if(!rows.length){
        return res.json({success: false,rows:[]});
    }
    const row =rows[0];

    // res.json({success: true, row});
    res.json({ success: true, rows });
});
//留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言留言























//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言



router.get("/api/detail_article_comment", async(req, res)=>{ 
    const article_id=req.query.article_id;    

    const sql = `SELECT A.article_id, A.article_member_id, A.article_member_name, A.article_boardcategory_name, A.article_title_name,  A.article_content, A.article_release_date, A.article_like_num, A.article_comment_num, A.pic, B.comment_id, B.comment_id, B.member_id, B.comment_member_name, B.article_id, B.comment_date, B.comment_content  
    FROM forum_article AS A
    JOIN forum_comment AS B ON A.article_id = B.article_id
    WHERE A.article_id = ?
    ORDER BY B.comment_date ASC`;      
    
const [rows]= await db.query(sql, [article_id]);
    const row=rows[0];

    const comments = rows.map((v)=>{
        return {comment_id:v.comment_id, comment_member_name:v.comment_member_name, comment_content:v.comment_content, comment_date:v.comment_date}
    })

    const data = {
    article_id: row.article_id,
    article_member_id: row.article_member_id,

    article_member_name: row.article_member_name,
    article_boardcategory_name: row.article_boardcategory_name,
    article_title_name: row.article_title_name,
    article_content:row.article_content,
    article_release_date: row.article_release_date,
    article_like_num: row.article_like_num,
    article_comment_num: row.article_comment_num,
    pic: row.pic,

    comments
    }

    

    res.json({success: true, data});
    // res.json({success: true, rows});
});











  router.get("/detail_article_comment/:article_id", async(req, res)=>{ 
     const article_id=req.params.article_id;    
     const sql = `SELECT A.article_id, A.article_content, B.comment_id, B.comment_content
     FROM forum_article AS A
     JOIN forum_comment AS B ON A.article_id = B.article_id
     WHERE A.article_id = ?`;      
     const [rows]= await db.query(sql, [article_id]);
     const row=rows[0]

    // 兩個的json檔案
    res.json({success: true, rows});
    // 兩個的json檔案


    // 單看文章
    // res.render("forum-address/detail_article_comment",rows[0], ); 
    // 單看文章


    // 單看留言
    // res.render("forum-address/detail_article_comment", {rows} ); 
    // 單看留言

// 文章跟留言一起
    // res.render("forum-address/detail_article_comment",{row, rows});
// 文章跟留言一起

  });
//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言//文章跟留言





export default router;//路由的基本架構


