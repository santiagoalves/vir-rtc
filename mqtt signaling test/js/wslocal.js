'use strict';

function clientMqtt(user, pass) {

	var client = new Paho.MQTT.Client("m13.cloudmqtt.com", 33723, user);

	client.onConnectionLost = function(responseObject) {
		document.querySelector("#consoleText").value += "\nconnection lost: " + responseObject.errorMessage;
		console.log("connection lost: " + responseObject.errorMessage);
	};

	client.onMessageArrived = function(message) {
		if (message.payloadString) {
			document.querySelector("#messageReceived").value += message.destinationName + ' -- ' + message.payloadString + "\n";
			//console.log(message.destinationName, ' -- ', message.payloadString);
		}
	};

 client.publish = function(topico, msg) {
        if(msg){
            var message = new Paho.MQTT.Message(msg);
            message.destinationName = topico;
            message.retained = false;
            client.send(message);
        }else{
            alert("inscreva uma msg antes de enviar")
        }
	}

	var options = {
		useSSL : true,
		userName : user,
		password : pass,
		timeout : 3,
		onSuccess : function() {
			document.querySelector("#consoleText").value += "\nmqtt connected";
			console.log("mqtt connected");
		},
		onFailure : function(message) {
			document.querySelector("#consoleText").value += "\nConnection failed: " + message.errorMessage;
		}
	};

	client.connect(options);

	return client;

}

var mqtt = null;// clientMqtt('vsbfalal','D1ibi1c5jLda');
//var mqtt = clientMqtt('other','other');
var topicosAssinados = [];

function publishing(topico, msg){
	mqtt.publish(topico.value,msg.value);
}

function assinarTopico(topico){
    if(topico && !topicosAssinados.find(function(item){return item === topico})){
        topicosAssinados.push(topico);
        mqtt.subscribe(topico);
    }
}

function desassinarTopico(topico){
    if(topico && topicosAssinados.find(function(item){return item === topico})){
        mqtt.unsubscribe(topico);
        topicosAssinados = topicosAssinados.filter(function(item){return item !== topico});
    }
}




