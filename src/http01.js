import http from "node:http";
// const http = require('http') 這個不行!!

// 原來這個http是套件啊





const serverbigJJ = http.createServer(
    (req, res)=>{
        res.writeHead(200,{
            'Content-Type': 'text/html; charset=utf8'
        })

        res.end(`
            <h2>he</h2>
            <p>${req.url}</p>
            `);
        });






// 啟動!!!!
serverbigJJ.listen(3000);

