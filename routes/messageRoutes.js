const { sendMessage, getAllMessage } = require("../controllers/messagesController")

const router = require("express").Router()

router.post("/sendMsg/", sendMessage)
router.post("/getMsg/", getAllMessage)

module.exports = router