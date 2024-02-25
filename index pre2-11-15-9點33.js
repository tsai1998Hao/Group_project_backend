import "dotenv/config";
//引入之後可以讓我們找到其他檔案的變數?
//載入.env這個檔案的設定

import express from "express";


import sales from "./data/sales.json" assert{ type:"json"};
//引入json

const app =express();
// 呼叫express


//設定ejs
// EJS(Embedded JavaScript templates)用於在Node.js中生成HTML。 讓我們可以將JavaScript嵌入到HTML中，從而可以根據資料動態生成HTML內容。
app.set('view engine','ejs');
//設定ejs

//定義路由?
app.get("/",(req, res)=>{
    res.render("home",{ name:"cute"});
});



//express的requset跟express的response，定義路由，用get方法才能拜訪，post不行
//定義路由，順序很重要!!!!!連到json
app.get("/json-sales",(req, res)=>{
//定義路由，順序很重要!!!!!連到json
//express的requset跟express的response，定義路由，用get方法才能拜訪，post不行

    res.render("json-sales",{ sales });
// 引入json

// 讓網頁顯示ejs(應該拉
    // res.render("home", {name:"87"});
// 讓網頁顯示ejs(應該拉


//可以res.send也可以res.end一個讓網頁顯示html，一個就是顯示文字
//res.send(`<h2>aassaa1a</h2>`);
//可以res.send也可以res.end一個讓網頁顯示html，一個就是顯示文字


//懂了!!res那裏就是回應.方式!!!!!
});







//取得queryString?，應該就是得到網址打的東西
app.get("/try-qs", (req, res) => {
    res.json(req.query);

    });
//取得queryString?，應該就是得到網址打的東西




const urlencodedParser= express.urlencoded({exrended: false})
//我們需要body-parser的功能，這個功能已經附在express裡面了，所以用express.urlencoded就好
//ture false 感覺比較不像是布林值而是一個編號，這個東西ture時的模式跟false時的模式不一樣

//取得post資料?urlencodedParser會去解析拿到的資料，然後放在req的body
app.post("/try-post",urlencodedParser, (req, res) => {
    console.log('啥鬼',req.body)
    res.json(req.body);

    });
//取得post資料?



//設定靜態內容的資料夾
app.use(express.static("public"))

// 連bootstrap，jquery
app.use("/bootstrap",express.static("node_modules/bootstrap/dist"))
app.use("jquery",express.static("node_modules/jquery/dist"))
// 連bootstrap，jquery


//另一種連的方式
// app.use(express.static("node_modules/bootstrap/dist"))
// app.use(express.static("node_modules/jquery/dist"))
//另一種連的方式


//設定靜態內容的資料夾


//創造404的頁面，use是所有方法的意思，所以要放get...等方法後面
app.use((req, res)=>{
    res.send('<h1>迷路了</h1>');
}
);
//創造404的頁面





const port =process.env.WEB_PORT || 3001;
//把.env檔案的設定import進來後，就可以拿來用

app.listen(port, ()=>{
    console.log(`express server 哈哈${port}`);
});