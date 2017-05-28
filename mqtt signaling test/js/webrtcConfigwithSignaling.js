
var sessionConnection = null;
var signalingChannel = null;

var networkAddressUtilityServer = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};

function initResources(){
    var media = {audio:true,video:true};
    navigator.mediaDevices.getUserMedia(media).then((function(stream){
        
        window.videoLocal.srcObject = stream;
        
        sessionConnection = new RTCPeerConnection(networkAddressUtilityServer);
        
        sessionConnection.addStream(stream);
        
        sessionConnection.onicecandidate = (event)=>{
            if(event.candidate){
                signalingChannel.sendCandidate(event.candidate);
            }
        }
        
        sessionConnection.onaddstream = (event)=>{
            window.videoRemote.srcObject = event.stream
        }
        
        signalingChannel = new MqttSignalingChannel('m13.cloudmqtt.com',33723,'vsbfalal','D1ibi1c5jLda','signalingChannelWebRTC');
        signalingChannel.onReceiveOffer = (offer)=>{
            sessionConnection.setRemoteDescription(offer).then(()=>{
                sessionConnection.createAnswer().then((answer)=>{
                    sessionConnection.setLocalDescription(answer).then(()=>{
                        signalingChannel.sendSDP(answer);
                    })
                })
            });
        };
        signalingChannel.onReceiveAnswer = (answer)=>{
            sessionConnection.setRemoteDescription(answer);
        };
        signalingChannel.onReceiveCandidate = (candidate)=>{
            sessionConnection.addIceCandidate(candidate);
        };
        
        signalingChannel.connect();
        
    }));
}

function call(){
    if(sessionConnection && signalingChannel){
        sessionConnection.createOffer().then((offer)=>{
            sessionConnection.setLocalDescription(offer).then(()=>{
                signalingChannel.sendSDP(offer);
            })
        });
    }else{
        throw 'iniciar recursos de comunicação antes de criar uma sessao!!!';
    }
}

function finalizarTransmicaoRemota(){
    if(sessionConnection){
        sessionConnection.close();
        console.log('sessao finalizada');
    }
}