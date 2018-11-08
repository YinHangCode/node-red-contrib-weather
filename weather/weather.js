const http = require("http");
const packageFile = require("../package.json");

module.exports = function(RED) {
    function WeatherNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
		
		this.log("*****************************************************************");
		this.log("    node-red-contrib-weather v"+packageFile.version+" By hang.yin");
		this.log(" GitHub: https://github.com/YinHangCode/node-red-contrib-weather ");
		this.log("                                            QQ Group: 107927710  ");
		this.log("*****************************************************************");
	
        var longitude = config.longitude;
        var latitude = config.latitude;

        node.on('input', function(msg) {
			node.httpGet({longitude: longitude, latitude: latitude}).then(result => {
				msg.payload = result;
				node.send(msg);
			}).catch(function(err) {
				that.error(err);
			});
        });
    }
	
	WeatherNode.prototype.httpGet = function(params) {
		let that = this;
		let encoding = 'utf8';
		let options = {
			hostname: "weatherapi.market.xiaomi.com",
			port: 80,
			path: '/wtr-v3/weather/all?' 
				+ "latitude=" + params['latitude'] + "&"
				+ "longitude=" + params['longitude'] + "&"
				+ "appKey=" + 'weather20180131' + "&"
				+ "sign=" + 'zUFJoAR2ZVrDy1vF3D07' + "&"
				+ "isGlobal=" + 'false' + "&"
				+ "locale=" + 'zh_cn',
			method: 'GET',
			timeout: 1200
		};
		that.log('HTTP ' + options.method + ': http://' + options.hostname + ':' + options.port + options.path);

		let data = '';
		return new Promise((resolve, reject) => {
			let req = http.request(options, (res) => {
				res.setEncoding(encoding);
				res.on('data', function(chunk) {
					data += chunk;
				});
	  
				res.on('end', function() {
					resolve(data);
				});
			});
	  
			req.on('error', (e) => {
				reject(new Error(e.message));
			});
			req.on('timeout', () => {
				reject(new Error('timeout'));
			});

			req.end();
		});
	}
	
    RED.nodes.registerType("weather", WeatherNode);
}
