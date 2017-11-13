const ComUtil = {
  makeCommand: function (msg, type) {
    let portMsg = '$XD01' + type + msg
    return portMsg
  }
}
export default ComUtil
