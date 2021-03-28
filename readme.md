socket server has following event lsiteners

-> register
This event will register the user it will take an object with and id
{ id: //can be any id to identify the user }

->notification
This event will sent notification to all the connected users it will take and object
{
    // this can be any kind of data you wanna send
}


->private notification
This event will sent the notification to a particular user only it will also take a object

{
    id: //id of the user you want to sent the notification
    data: //any data you wanna send
}

