import http from "node:http";

const server = http.createServer((req, res)=>{

    res.end(`
    <h2>Hi</h2>
    <p>${req.url}</p>`
    );
}

);

server.listen(9000);

console.log("window");