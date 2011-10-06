/**
 * AudioDance
 * webkitAudioContextを使って、音とCanvas描画をシンクロさせます。
 * 
 * 参考URL：
 * http://jsdo.it/mackee/9WGv
 * http://www.usamimi.info/~ide/programe/tinysynth/doc/audioapi-report.pdf
 * http://epx.com.br/artigos/audioapi.php
 * http://paperjs.org/
 */

(function() {

var AudioDance = {};

var 
	context,
	source,
	gainNode,
	analyserNode,
	timeDomainData,
	
	canvas,
	options = [],
	circles = [],
	path,
	
	SHOW_CIRCLES_COUNT = 20,
	SOUND_FILE = "Eris.ogg";

AudioDance.play = function() {
	if (!window.webkitAudioContext) {
		throw "UnSupported AudioContext";
	}
	
	createAudioContext();
}

function createAudioContext() {
	context = new webkitAudioContext();
	source = context.createBufferSource();
	gainNode = context.createGainNode();
	analyserNode = context.createAnalyser();

	gainNode.gain.value = 0.5;

	source.connect(gainNode);
	gainNode.connect(analyserNode);
	analyserNode.connect(context.destination);

	createXHR("sound/" + SOUND_FILE, function(xhr) {
		init(xhr);
	});
	
	timeDomainData = new Uint8Array(analyserNode.frequencyBinCount);
}

function createXHR(url, fn) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "arraybuffer";

	xhr.onload = function() {
	    fn(xhr);
	};

	xhr.send();
}

function init(xhr) {
	// ArrayBufferからバッファを作成　第２引数をtrueにするとモノラルに
    source.buffer = context.createBuffer(xhr.response, false);
	// 指定した時間に再生する　もし指定した時間がcontext.currentTimeより小さい場合はすぐ再生される
    source.noteOn(context.currentTime);

	for (var i=0; i<SHOW_CIRCLES_COUNT; i++) {
		options.push({
			x: Math.floor(Math.random() * $(window).width()),
			y: Math.floor(Math.random() * $(window).height()),
			color: "#" + getColor()
		})
	}

	canvas = document.getElementById("canvas");
	paper.setup(canvas);
	paper.view.onFrame = onFrame;
}

function onFrame() {
	// analyserNode.getByteTimeDomainData(timeDomainData);
	analyserNode.getByteFrequencyData(timeDomainData);

	// drawCircle(timeDomainData);
	drawImage(timeDomainData);
	// drawGraph(timeDomainData);
}

function drawCircle(data) {
	for (var i=0; i<SHOW_CIRCLES_COUNT; i++) {
		if (circles[i]) {
			circles[i].remove();
		}
		
		if (i % 2 === 0) {
			// 星
			circles[i] = new paper.Path.Star(new paper.Point(options[i].x, options[i].y), 5, 50, 100);

			// 四角
			// var point = new paper.Point(options[i].x, options[i].y);
			// var size = new paper.Size(100, 100);
			// var rectangle = new paper.Rectangle(point, size);
			// circles[i] = new paper.Path.Rectangle(rectangle);

			circles[i].fillColor = options[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);

			// circles[i].rotate(data[50 * (i + 1)]);	// rotate入れるとだいぶ重くなる
		} else {
			// 丸
			circles[i] = new paper.Path.Circle(new paper.Point(options[i].x, options[i].y), 100);
			circles[i].fillColor = options[i].color;
			circles[i].scale(data[50 * (i + 1)] / 80);
		}
	}
	// paper.view.draw();
}

var speaker1, speaker2;
function drawImage(data) {
	if (speaker1) {
		speaker1.remove();
	}
	
	var size = 300,
		left = Math.floor(($(window).width()) / 2),
		top = Math.floor(($(window).height()) / 2);

	speaker1 = new paper.Raster("speaker");
	speaker1.size = new paper.Size(size, size);
	speaker1.position = new paper.Point(left - size, top);
	speaker1.scale(data[50 * (5 + 1)] / 100);

	if (speaker2) {
		speaker2.remove();
	}
	speaker2 = new paper.Raster("speaker");
	speaker2.size = new paper.Size(size, size);
	speaker2.position = new paper.Point(left + size, top);
	speaker2.scale(data[50 * (8 + 1)] / 100);
}

function drawGraph(data) {
	if (path) {
		path.remove();
	}

	var dataLength = data.length;

	path = new paper.Path();
	path.strokeColor = "#FF7575";

	for (var i=0; i<dataLength; ++i){
		value = data[i]-128 + 100;
		path.lineTo(new paper.Point(i, value));
	}
}

function getRGB() {
	return Math.floor(Math.random() * 1);
}

function getColor() {
	return "C9" + Math.floor(Math.random() * 0x59FF).toString(16);
}

window.AudioDance = AudioDance;

})();
