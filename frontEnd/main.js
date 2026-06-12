
const clientIo = io("http://localhost:3000", {
    auth: {
        authorization: localStorage.getItem("authorization")
    }
})

clientIo.emit("saiHello", "Hello from FrontEnd")
clientIo.on("connect_error", (error) => {
    console.log(error)
})
