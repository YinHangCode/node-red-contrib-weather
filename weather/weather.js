const http = require("http");
var validator = require('validator');

module.exports = function (RED) {
	function WeatherNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;

		var longitude = config.longitude;
		var latitude = config.latitude;

		let weather = new Object();
		let temperature = new Object();
		let humidity = new Object();
		let weather_code = new Object();
		let aqi = new Object();
		let sunrise = new Object();
		let sunset = new Object();

		node.on('input', function (msg) {
			// Verify input is json
			if (validator.isJSON(String(msg.payload))) {
				let parameter;
				parameter = JSON.parse(msg.payload);
				if (parameter) {

					latitude = String(parameter.latitude);
					longitude = String(parameter.longitude);

					node.httpGet({ longitude: longitude, latitude: latitude }).then(result => {
						weather.payload = JSON.parse(result);

						temperature.payload = weather.payload.current.feelsLike.value + weather.payload.current.feelsLike.unit;
						humidity.payload = weather.payload.current.humidity.value + weather.payload.current.humidity.unit;
						weather_code.payload = weather.payload.current.weather;
						aqi.payload = weather.payload.forecastDaily.aqi.value[0];
						sunrise.payload = weather.payload.forecastDaily.sunRiseSet.value[0].from;
						sunset.payload = weather.payload.forecastDaily.sunRiseSet.value[0].to;

						node.send([weather, temperature, humidity, weather_code, aqi, sunrise, sunset]);
					}).catch(function (err) {
						RED.log.error(err);
					});

				}
				else {
					RED.log.error("Json Obj is null");
				}
			}
			else {
				node.httpGet({ longitude: longitude, latitude: latitude }).then(result => {

					weather.payload = JSON.parse(result);
					temperature.payload = weather.payload.current.feelsLike.value + weather.payload.current.feelsLike.unit;
					humidity.payload = weather.payload.current.humidity.value + weather.payload.current.humidity.unit;
					weather_code.payload = weather.payload.current.weather;
					aqi.payload = weather.payload.forecastDaily.aqi.value[0];
					sunrise.payload = weather.payload.forecastDaily.sunRiseSet.value[0].from;
					sunset.payload = weather.payload.forecastDaily.sunRiseSet.value[0].to

					node.send([weather, temperature, humidity, weather_code, aqi, sunrise, sunset]);
				}).catch(function (err) {
					RED.log.error(err);
				});
			}

		});
	}

	WeatherNode.prototype.httpGet = function (params) {
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
				res.on('data', function (chunk) {
					data += chunk;
				});

				res.on('end', function () {
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
