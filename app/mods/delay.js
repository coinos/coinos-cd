const delay = async (seconds) =>
  await new Promise((r) => setTimeout(r, seconds ? seconds * 1000 : 1000))

module.exports = delay