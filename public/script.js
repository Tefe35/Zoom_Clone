const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '443',
  path: '/peerjs',
});

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.recorded = true;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
      alert('Somebody connected', userId);
    });

    myPeer.on('call', (call) => {
      call.answer(stream);

      const video = document.createElement('video');
      call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });

    //  input value
    let text = $('input');
    // when press enter send message
    $('html').keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        console.log(text.val());
        socket.emit('message', text.val()); //send message
        text.val('');
      }
    });

    socket.on('createMessage', (message, userId) => {
      // console.log('this is my message !', message);
      $('ul').append(`<li>
								<span class="messageHeader">
									<span>
										From 
										<span class="messageSender">Someone</span> 
										to 
										<span class="messageReceiver">Everyone:</span>
                  </span>
									${new Date().toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
								</span>
								<span class="message">${message}</span>
							</li>`);

      scrollToBottom();
    });
  });

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop('scrollHeight'));
};

//mute & unmute microphone

const muteUnmute = () => {
  console.log(myVideoStream);

  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false; //disabled
    setUnmute();
  } else {
    setMute();
    myVideoStream.getAudioTracks()[0].enabled = true; //enabled
  }
};

//play & stop video
const playStop = () => {
  console.log('object');
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

// mute microphone
const setMute = () => {
  const html = `<i class="fas fa-microphone"></i><span>Mute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
};

// unmute microphone
const setUnmute = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

// stop video
const setStopVideo = () => {
  const html = `<i class="fas fa-video"></i><span>Stop Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
};
// on video
const setPlayVideo = () => {
  const html = `<i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html;
};
