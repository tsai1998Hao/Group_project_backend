import http from "node:http";
import fs from "node:fs/promises";//node內建的套件，有promise的功能


const server = http.createServer(async(req, res)=>{
    const jsonStr =JSON.stringify(req.headers, null, 4);  //拿到JSON，headers是一個req的類型，null幫你做縮排
    
    await fs.writeFile("./headerssss.txt", jsonStr);  //創建一個檔案

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf8'   //回應的檔案類型
  })
  res.end(jsonStr);
});

server.listen(3002);
