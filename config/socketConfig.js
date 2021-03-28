
const { default: axios } = require('axios')
const { postMessage } = require('../actions/messageActions')
module.exports = (server) => {

    const io = require('socket.io')(server ,  { cors:{ origin:'*'}})

    io.on('connection' , socket => {

        console.log('A user connected' , socket.id)


        // User registering event
        socket.on('register' , (user) => {
            
            //the data must contain an id field

            console.log(user)
            const { id , data } = user
            const alreadyRegistered = connectedUsers.find(user => user.id == id)
            if(alreadyRegistered === undefined){
                
                connectedUsers = [...connectedUsers , { socketId:socket.id , id , data}]
                sockets = [...sockets , { socket:socket , id:id }]
            }
          
            // io.emit('hey')
            socket.broadcast.emit('register' , connectedUsers)

        })

        socket.on('register background user' , (user) => {
            console.log(user)

            const { id } = user

            const alreadyRegistered = backgroundUsers.find(user => user.id == id)
            if(alreadyRegistered === undefined){
                console.log('background user registered')
                backgroundUsers = [...backgroundUsers , { socket , id }]
            }else {
                console.log('background user updated')
                const findRegisteredUserIndex = backgroundUsers.findIndex(user => user.id == id)
                backgroundUsers[findRegisteredUserIndex] = { socket , id }
            }

            console.log(backgroundUsers);
            io.emit('hey');

            
            // socket.broadcast.emit('register' , backgroundUsers)

        })

        // private notification
        socket.on('notification' , (data) => {

            const {id , notification} = data
            const sender = connectedUsers.find(user => user.socketId == socket.id);
            const reciever = connectedUsers.find(user => user.id == id);

            console.log('notification event called',data);

            if(reciever !== undefined){
                socket.to(reciever.socketId).emit("notification" , { sender , notification })
            }else{
                const IsRecieverInBack = backgroundUsers.find(user => user.id == id)

                if(IsRecieverInBack !== undefined)
                socket.to(IsRecieverInBack.socket.id).emit("notification" , { sender , notification })
            }
           
                  

        })

        //global notification
        socket.on('broadcast notification' , (data) => {
            
            const sender = connectedUsers.find(user => user.socketId == socket.id);
            console.log(data);

            socket.broadcast.emit("broadcast notification" , { sender , notification:data })
        })


        //group notification
        socket.on('group notification' , (data) => {

            const { notification , members } = data
            const sender = connectedUsers.find(user => user.socketId == socket.id);

            let i = 0;

            const filteredUsers = connectedUsers.filter(user => {
                return user.id == members[i++].id
            })

            console.log(filteredUsers)

            filteredUsers.forEach(user => {
                socket.to(user.socketId).emit('group notification' , { sender , notification })
            })
        

        })



        // message event for shehzad
        socket.on('msg' , (data) => {
            const {id , message , type} = data
            const sender = connectedUsers.find(user => user.socketId == socket.id);
            const reciever = connectedUsers.find(user => user.id == id)

            if(reciever !== undefined)
            socket.to(reciever.socketId).emit("message" , { sender , message , type});
        })
        // end message event for shehzad

        //private message
        socket.on('message' , (data , callback) => {

            console.log('message called');
            console.log(data)
        
            const {id , message , type} = data

            if(type == 'text' || type == 'media'){
            // console.log(id , msg);
            // console.log('message event called');
            const sender = connectedUsers.find(user => user.socketId == socket.id);
            const reciever = connectedUsers.find(user => user.id == id)


                const msgToPost = { messageFrom:{ id:sender.id } , message , isRead:false , isDelivered:false , messageType:type , messageTo:{ id:id }}

                console.log('message to post' ,msgToPost)
                
                axios.post('/messages' , msgToPost)
                .then(response => {

                    console.log('message posted')

                    if(reciever !== undefined)
                    socket.to(reciever.socketId).emit("message" , response.data);

                    process.nextTick(() => {
                        callback({
                            status:'ok',
                            message:response.data,
                            err:null,
                        })
                    })
                   
                })
                .catch(err => {

                    console.log('message posting failed')

                    if(err.response.data !== undefined)
                    console.log(err.response.data)

                    process.nextTick(() => {
                        callback({
                            status:'failed',
                            message:null,
                            err:err.response.data !== undefined ? err.response.data:null
                        })
                    })
                  
                })
      

        }else{
            callback({
                status:'failed',
                message:null,
                err:'Message type can be only text or media'
            })
        }
            // console.log(reciever);
            // socket.broadcast.emit('message', data);
        })



        //global message
        socket.on('broadcast message' , (data) => {

            const { message , type } = data

            const sender = connectedUsers.find(user => user.socketId == socket.id);
            socket.broadcast.emit('broadcast message' , { sender , message , type });
        })


        //group message
        socket.on('group message' , (data) => {

            const { message , members , type } = data
            const sender = connectedUsers.find(user => user.socketId == socket.id);

            console.log('members' , members);

            let filteredUsers = []
            members.forEach(member => {

                const userFound = connectedUsers.find(user => {
                    return user.id == member.id
                })

                if(userFound !== undefined){
                    filteredUsers = [...filteredUsers , userFound]
                }
                
            })

            // let i = 0;

            // const filteredUsers = connectedUsers.filter(user => {
            //     return user.id == members[i++].id
            // })

            // console.log(filteredUsers)

            filteredUsers.forEach(user => {
                socket.to(user.socketId).emit('group message' , { sender , message , type })
            })
        
            
        })

        

        socket.on('leave' , () => {

            const filteredUsers = connectedUsers.filter(user => user.socketId != socket.id)
            connectedUsers = [...filteredUsers]

            const filteredSockets = sockets.filter(socket => socket.socket.socketId != socket.id)
            sockets = [...filteredSockets]

            console.log('leave' , filteredUsers);
            socket.broadcast.emit('leave' , filteredUsers);
        })


        socket.on('disconnect' , () => {

            const filteredUsers = connectedUsers.filter(user => user.socketId != socket.id)
            connectedUsers = [...filteredUsers]
            console.log(connectedUsers);
            console.log('User disconnected')
        })

    })


        // socket.on('register group' , (data) => {

        //     const admin = connectedUsers.find(user => user.socketId == socket.id);
        //     const { roomId , members } = data;

        //     let i = 0; 

        //     rooms = [...rooms , { id:roomId , members:members }]

        //     const filteredSockets = sockets.filter(sck => {
        //         return sck.id == members[i++].id
        //     })

        //     filteredSockets.forEach(sck => {
        //         sck.join(roomId);
        //     })

        //     socket.to(roomId).emit('register group' , { admin , members })
          

        // })

    

}