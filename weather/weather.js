const http = require("http");
var validator = require('validator');

module.exports = function (RED) {
	function WeatherNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;

		var longitude = config.longitude;
		var latitude = config.latitude;

		node.on('input', function (msg) {
			if (validator.isJSON(String(msg.payload))) {
				let parameter;
				parameter = JSON.parse(msg.payload);
				if (parameter) {

					latitude = String(parameter.latitude);
					longitude = String(parameter.longitude);

					node.httpGet({ longitude: longitude, latitude: latitude }).then(result => {
						let weather = JSON.parse(result);
						let temperature = weather.current.feelsLike.value + weather.current.feelsLike.unit;
						let humidity = weather.current.humidity.value + weather.current.humidity.unit;
						let weather_code = weather.current.weather;
						let aqi = weather.forecastDaily.aqi.value[0];
						let sunrise = weather.forecastDaily.sunRiseSet.value[0].from;
						let sunset = weather.forecastDaily.sunRiseSet.value[0].to;

						node.send([temperature, humidity, weather_code, aqi, sunrise, sunset, weather]);
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

					let weather = JSON.parse(result);
					let temperature = weather.current.feelsLike.value;
					let humidity = weather.current.humidity.value;
					let weather_code = weather.current.weather;
					let aqi = weather.forecastDaily.aqi.value[0];
					let sunrise = weather.forecastDaily.sunRiseSet.value[0].from;
					let sunset = weather.forecastDaily.sunRiseSet.value[0].to;

					node.send([temperature, humidity, weather_code, aqi, sunrise, sunset, weather]);
				}).catch(function (err) {
					that.error(err);
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
