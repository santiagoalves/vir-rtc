var MqttSignalingChannel = function(url, port, user, pass, channelName){
    //var sig = new MqttSignalingChannel("m13.cloudmqtt.com",33723,'vsbfalal','D1ibi1c5jLda','signalingRTC')
    this.user  = user ;
    this.pass = pass;
    this.channelName = channelName;
    this.client = new Paho.MQTT.Client(url, port, '', Math.random()+'');
    
    this.onReceiveCandidate = null;
    this.onReceiveAnswer = null;
    this.onReceiveOffer = null;
    
    this.offerCreatedChannel = channelName+'/offerCreated';
    this.answerReceivedChannel = channelName+'/answerReceived';
    this.candidateReceivedChanner = channelName+'/candidateReceived';
    
    var OFFER_TYPE = 'offer';
    var ANSWER_TYPE = 'answer';

    MqttSignalingChannel.prototype.connect = function(){
        if(this.onReceiveCandidate && this.onReceiveAnswer && this.onReceiveOffer){
            if(this.channelName){
                var this_client = this.client;
                
                var _offerCreatedChannel = this.offerCreatedChannel;
                var _answerReceivedChannel = this.answerReceivedChannel;
                
                _onReceiveCandidate = this.onReceiveCandidate;
                _onReceiveAnswer    = this.onReceiveAnswer;
                _onReceiveOffer     = this.onReceiveOffer;
                
                this.client.connect({
                    useSSL : true,
                    userName : this.user,
                    password : this.pass,
                    timeout : 3,
                    onSuccess : function() {
                        console.log('signaling channel ' + this_client.clientId + ' connected');
                        // irah atender a uma resposta criada por outro peer connectado na sessao,
                        // a uma oferta realizada pelo mesmo.
                        this_client.subscribe(_offerCreatedChannel);
                        this_client.subscribe(_answerReceivedChannel);
                        
                        this_client.onMessageArrived = function(message){
                            console.log('message arrived!!!');
                            console.log(message);
                            var data = JSON.parse(message.payloadString);
                            // se for um candidate ou sdp antigo, serah ignorado
                            if(sendedLessThen60seconds(data.timeStamp)){
                                if(data.body.candidate){
                                    _onReceiveCandidate(data.body);
                                }else if(data.body.type){
                                    if(data.body.type===OFFER_TYPE){
                                        _onReceiveOffer(data.body);
                                    }else if(data.body.type===ANSWER_TYPE){
                                        _onReceiveAnswer(data.body);
                                    }
                                }
                            }
                        }
                        
                    },
                    onFailure : function(error) {
                        throw 'signaling channel ' + this_client.clientId + ' failed to connect: ' + error;
                    }
                });
                
            }else{
                throw 'channelName method must be set before init connection!!!';
            }
        }else{
            throw 'onReceiveCandidate, onReceiveAnswer and onReceiveOffer methods must be implemented before call for connection!!!';
        }
    }
    
    MqttSignalingChannel.prototype.sendCandidate = function(rtcIceCandidate){
        if(rtcIceCandidate.candidate){
            console.log('enviando candidate...');
            console.log(rtcIceCandidate);
            sendMessage(this.client, this.offerCreatedChannel, rtcIceCandidate)
        }else{
            throw 'argument must be an RTCIceCandidate instance!!!';
        }
    }
    
    MqttSignalingChannel.prototype.sendSDP = function(rtcSessionDescription){
        if(rtcSessionDescription.type && rtcSessionDescription.sdp){
            if(rtcSessionDescription.type){
                console.log('enviando SDP...');
                console.log(rtcSessionDescription);
                if(rtcSessionDescription.type===OFFER_TYPE){
                    this.client.unsubscribe(this.offerCreatedChannel);
                    sendMessage(this.client, this.offerCreatedChannel, rtcSessionDescription);
                }else if(rtcSessionDescription.type===ANSWER_TYPE){
                    this.client.unsubscribe(this.answerReceivedChannel);
                    sendMessage(this.client, this.answerReceivedChannel, rtcSessionDescription);
                }
            }
        }else{
            throw 'argument must be an RTCSessionDescription instance!!!';
        }
    }
    
    function sendMessage(client, topic,data){
        var EXACTLY_ONCE = 2;
        var msg = JSON.stringify({timeStamp:new Date().getTime(),body: data})
        var message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        message.retained = false;
        message.qos = EXACTLY_ONCE;
        client.send(message);
    }
    
    function sendedLessThen60seconds(timeStamp){
        return (new Date().getTime() - timeStamp)/1000 < 60;
    }
    
}