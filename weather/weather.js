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
		let weather_status = new Object();
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
						weather_status.payload = weatherStatus(weather.payload.current.weather);
						aqi.payload = weather.payload.forecastDaily.aqi.value[0];
						sunrise.payload = weather.payload.forecastDaily.sunRiseSet.value[0].from;
						sunset.payload = weather.payload.forecastDaily.sunRiseSet.value[0].to;

						node.send([weather, temperature, humidity, weather_status, aqi, sunrise, sunset]);
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
					weather_status.payload = weatherStatus(weather.payload.current.weather);
					aqi.payload = weather.payload.forecastDaily.aqi.value[0];
					sunrise.payload = weather.payload.forecastDaily.sunRiseSet.value[0].from;
					sunset.payload = weather.payload.forecastDaily.sunRiseSet.value[0].to

					node.send([weather, temperature, humidity, weather_status, aqi, sunrise, sunset]);
				}).catch(function (err) {
					RED.log.error(err);
				});
			}

		});
	}
	function weatherStatus(code)
	{
		let status = "";
		// weather code to weather status
		switch(code) {
		case '0':
			status = '晴'
			break;
		case '1':
			status = '多云'
			break;
		case '2':
			status = '阴'
			break;
		case '3':
			status = '阵雨'
			break;
		case '4':
			status = '雷阵雨'
			break;
		case '5':
			status = '雷阵雨并伴有冰雹'
			break;
		case '6':
			status = '雨夹雪'
			break;
		case '7':
			status = '小雨'
			break;
		case '8':
			status = '中雨'
			break;
		case '9':
			status = '大雨'
			break;
		case '10':
			status = '暴雨'
			break;
		case '11':
			status = '大暴雨'
			break;
		case '12':
			status = '特大暴雨'
			break;
		case '13':
			status = '阵雪'
			break;
		case '14':
			status = '小雪'
			break;
		case '15':
			status = '中雪'
			break;
		case '16':
			status = '大雪'
			break;
		case '17':
			status = '暴雪'
			break;
		case '18':
			status = '雾'
			break;
		case '19':
			status = '冻雨'
			break;
		case '20':
			status = '沙尘暴'
			break;
		case '21':
			status = '小雨转中雨'
			break;
		case '22':
			status = '中雨转大雨'
			break;
		case '23':
			status = '大雨转暴雨'
			break;
		case '24':
			status = '暴雨转大暴雨'
			break;
		case '25':
			status = '大暴雨转特大暴雨'
			break;
		case '26':
			status = '小雪转中雪'
			break;
		case '27':
			status = '中雪转大雪'
			break;
		case '28':
			status = '大雪转暴雪'
			break;
		case '29':
			status = '浮沉'
			break;
		case '30':
			status = '扬沙'
			break;
		case '31':
			status = '强沙尘暴'
			break;
		case '32':
			status = '飑'
			break;
		case '33':
			status = '龙卷风'
			break;
		case '34':
			status = '若高吹雪'
			break;
		case '35':
			status = '轻雾'
			break;
		case '53':
			status = '霾'
			break;
		case '99':
			status = '未知'
			break;
		default:
			status = '无数据'
			break;
		}
		
		return status;
		
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
