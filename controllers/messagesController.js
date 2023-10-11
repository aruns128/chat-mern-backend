const messageModel = require('../model/messageModel');

module.exports.sendMessage = async (req, res, next) => {
  try {
    const { from, to, messages } = req.body;
    const data = await messageModel.create({
      message: { text: messages },
      users: [from, to],
      sender: from
    })
    if (data) {
      return res.json({ msg: 'message added successfully' })
    } else {
      return res.json({ msg: 'Failed to add message to the databases' })
    }
  } catch (exception) {
    next(exception)
  }
}
module.exports.getAllMessage = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await messageModel.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
}