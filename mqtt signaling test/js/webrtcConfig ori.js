function startLocal(){
    navigator.mediaDevices.getUserMedia({
        audio:false,
        video:true
    }).then(function(stream){
        window.videoLocal.srcObject = stream;
        window.videoLocal.addEventListener('loadedmetadata',function(w){
            console.log('foi adicionado uma fonte de dados ao videoplayer!');
        });
    }).catch(function(error){
        console.log(error);
        alert('erro ao adquirir midia!!!');
    })
}

function iniciarTransmissaoRemota(){
    var server = null;
    
    var local = window.local = new RTCPeerConnection(server);
    local.onicecandidate = function(event){
        if(event.candidate){
            console.log('local onicecandidate');
            console.log(event);
            remote.addIceCandidate(event.candidate).then(function(){
                console.log('icecandidate add local to remote complete!!!');
            },logError);
        }
    }
    local.oniceconnectionstatechange = function(event){
        console.log('local statechange');
        console.log(event);
    }
    local.addstream = window.videoLocal.srcObject;
    
    var remote = window.remote = new RTCPeerConnection(server);
    remote.onicecandidate = function(event){
        if(event.candidate){
            console.log('remote');
            console.log(event);
            local.addIceCandidate(event.candidate).then(function(){
                console.log('icecandidate add remote to local complete!!!');
            });
        }
    }
    remote.oniceconnectionstatechange = function(event){
        console.log('remote statechange');
        console.log(event);
    }
    
    remote.onaddstream = function(event){
        console.log('videoRemote addstream!!!');
        window.videoRemote.srcObject = event.stream;
    }
    /**** criando oferta de conexão ****/
    local.createOffer({
        offerToReceiveAudio:1,
        offerToReceiveVideo:1
    }).then(function successCreatedOffer(offer){
      //  console.log('Offer from pc1\n'+offer.sdp);
        local.setLocalDescription(offer).then(function successSetSDP(){
            console.log('setLocalSDP o peerlocal complete!!!');
        },logError);
        
        remote.setRemoteDescription(offer).then(function sucessSetSDP(){
            console.log('setRemoteSPD complete!!!');
        },logError);
        
        /**** criando resposta de conexão ****/
        remote.createAnswer().then(function successCreateAnswer(answer){
            remote.setLocalDescription(answer).then(function(){
                console.log('setLocalSDP para o peer remoto complete!!!');
            },logError);
            local.setRemoteDescription(answer).then(function(){
                console.log('setRemoteSDP para o peer local complete!!!');
            })
        },logError);
        /**** fim criando resposta de conexão ****/
    }, logError);
    /**** fim criando oferta de conexão ****/
}

function logError(error){
    console.log('********ERRO********');
    console.log(error);
}