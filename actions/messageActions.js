const { default: axios } = require("axios")

const postMessage = async (message) => {
    return axios.post('/messages' , message)
}

module.exports = {
    postMessage
}