
const clientIo = io("http://localhost:3000")

clientIo.emit("saiHello","Hello from FrontEnd")
clientIo.on("saiHelloBE",(data)=>{
    console.log(data)
})
