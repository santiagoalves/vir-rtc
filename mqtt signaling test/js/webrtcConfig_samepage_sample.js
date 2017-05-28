navigator.mediaDevices.getUserMedia({audio:true,video:true}).then((stream)=>{
    
    window.videoLocal.srcObject = stream;
    var pc1 = new RTCPeerConnection(null);
    pc1.addStream(stream);
    
    pc1.createOffer().then((offer)=>{
        pc1.setLocalDescription(offer).then(()=>{
            pc1.onicecandidate = (event)=>{
                pc2.addIceCandidate(event.candidate)
            }
            
            var pc2 = new RTCPeerConnection(null);
            pc2.onicecandidate = (event)=>{
                pc1.addIceCandidate(event.candidate)
            }
            pc2.onaddstream = (event)=>{window.videoRemote.srcObject = event.stream}
            
            pc2.setRemoteDescription(offer).then(()=>{
                pc2.createAnswer().then((answer)=>{
                    pc2.setLocalDescription(answer).then(()=>{
                        pc1.setRemoteDescription(answer);
                    });
                });
            })
            
        });
    });
    
})
