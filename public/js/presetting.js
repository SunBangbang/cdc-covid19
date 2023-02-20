// preset before starting RTC
class Presetting {
  init() {
    // populate userId/roomId
    $('#userId').val('user_' + parseInt(Math.random() * 100000000));
    $('#roomId').val(parseInt(Math.random() * 100000));
    const match1 = window.location.search.match(new RegExp('(\\?|&)' + 'roomId' + '=([^&]*)(&|$)'));
    const roomId = !match1 ? '' : decodeURIComponent(match1[2]);
    const match2 = window.location.search.match(new RegExp('(\\?|&)' + 'userId' + '=([^&]*)(&|$)'));
    const userId = !match2 ? '' : decodeURIComponent(match2[2]);

    // const roomId = this.queryById('roomId');
    // const userId = this.queryById('userId');
    if (roomId) {
      $('#roomId').val(roomId);
    }
    if (userId) {
      $('#userId').val(userId);
    }

    $('#main-video-btns').hide();
    $('.mask').hide();
    setBtnClickFuc();
  }

  // Don't know why this method is not supported by safari and firefox. Move to init instead -- Commented by Charles
  // queryById(name) {
    // const match = window.location.search.match(new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)'));
    // return !match ? '' : decodeURIComponent(match[2]);
  // }

  login(share, meetingId, sdk, username, sign, shareSign, callback) {
    let userId = username;
    if (share) {
      userId = 'share_' + userId;
    }
    const sdkAppId = Number(sdk);
    const userSig = sign;
    const shareUserSign = shareSign;
    const roomId = meetingId;

    callback({
      sdkAppId,
      userId,
      userSig,
      shareUserSign,
      roomId
    });
  }
}
