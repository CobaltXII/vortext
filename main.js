// Create a shader.
function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('Unable to compile the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

// Create a shader program.
function createShaderProgram(gl, vsSource, fsSource) {
	var vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Unable to create a shader program.\n" + gl.getProgramInfoLog(shaderProgram));
		gl.deleteProgram(shaderProgram);
		return null;
	}
	return shaderProgram;
}

// Create a final shader program.
function createFinalShaderProgram(gl, vsSource, fsSource) {
	var shaderProgram = createShaderProgram(gl, vsSource, fsSource);
	return {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
		},
		uniformLocations: {
			iResolution: gl.getUniformLocation(shaderProgram, "iResolution"),
			iTime: gl.getUniformLocation(shaderProgram, "iTime"),
			iOffsetZ: gl.getUniformLocation(shaderProgram, "iOffsetZ"),
			iColor0: gl.getUniformLocation(shaderProgram, "iColor0"),
			iColor1: gl.getUniformLocation(shaderProgram, "iColor1")
		}
	};
}

// Generate a square position buffer.
function generateSquarePositionBuffer(gl) {
	var arrayBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
	var positions = [
		-1.0, +1.0,
		+1.0, +1.0,
		-1.0, -1.0,
		+1.0, -1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	return arrayBuffer;
}

// Glyph width lookup table.
var widths = {
	"a": 4, "b": 4, "c": 4, "d": 4,
	"e": 4, "f": 4, "g": 4, "h": 4,
	"i": 0, "j": 4, "k": 4, "l": 0,
	"m": 8, "n": 4, "o": 4, "p": 4,
	"q": 4, "r": 4, "s": 4, "t": 4,
	"u": 4, "v": 4, "w": 8, "x": 4,
	"y": 4, "z": 4, "A": 4, "B": 4,
	"C": 4, "D": 4, "E": 4, "F": 4,
	"G": 4, "H": 4, "I": 4, "J": 4,
	"K": 4, "L": 4, "M": 8, "N": 4,
	"O": 4, "P": 4, "Q": 4, "R": 4,
	"S": 4, "T": 4, "U": 4, "V": 4,
	"W": 8, "X": 4, "Y": 4, "Z": 4,
	"0": 4, "1": 4, "2": 4, "3": 4,
	"4": 4, "5": 4, "6": 4, "7": 4,
	"8": 4, "9": 4
};

// Measure the width of a string.
function measureText(text) {
	var length = 0;
	for (var i = 0; i < text.length; i++) {
		if (text[i] == " ") {
			length += 3;
		} else {
			if (text[i] in widths) {
				length += widths[text[i]];
				if (i != text.length - 1) {
					length += 2;
				}
			} else {
				console.error("Bad character '" + text[i] + "' at index " + i + " in string \"" + text + "\"");
			}
		}
	}
	return length;
}

// Generate the SDF of a string.
function generateSDF(text) {
	var length = measureText(text);
	var lines = [];
	lines.push("// SDF of the scene.");
	lines.push("float z_offset = float(" + (length / 2) + ");");
	lines.push("float sdf(in vec3 pos) {");
	lines.push("	float t = 1000.0;");
	lines.push("	vec3 offset = vec3(" + (-length / 2) + ", 4, " + Math.ceil(-length * 0.65) + ");");
	var x = 0;
	for (var i = 0; i < text.length; i++) {
		if (text[i] == ' ') {
			x += 3;
		} else {
			if (text[i] in widths) {
				lines.push("	t = min(t, sdf_" + text[i] + "(pos, vec3(" + x + ", 0, 0) + offset));");
				x += widths[text[i]];
				if (i != text.length - 1) {
					x += 2;
				}
			} else {
				console.error("Bad character '" + text[i] + "' at index " + i + " in string \"" + text + "\"");
			}
		}
	}
	lines.push("	return t;");
	lines.push("}");
	return lines.join('\n');
}

// Main.
function main() {
	// Get the WebGL context.
	var canvas = document.querySelector("#glCanvas");
	var scale = 2;
	canvas.width = window.innerWidth / scale;
	canvas.height = window.innerHeight / scale;
	var gl = canvas.getContext("webgl");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	// Create the shader program.
	var vsSource = document.querySelector("#vsSource").text;
	var fsSource = document.querySelector("#fsSource").text.replace("$$$SDF$$$", generateSDF("CobaltXII"));
	var shaderProgram = createFinalShaderProgram(gl, vsSource, fsSource);

	// Create the square buffer.
	var squareBuffer = generateSquarePositionBuffer(gl);

	// Create the controller.
	var controller = {
		text: "CobaltXII",
		offsetZ: 0.0,
		color0: [0.0, 0.0, 255.0],
		color1: [255.0, 0.0, 0.0],
		update: function() {
			vsSource = document.querySelector("#vsSource").text;
			fsSource = document.querySelector("#fsSource").text.replace("$$$SDF$$$", generateSDF(this.text));

			gl.deleteProgram(shaderProgram.program);
			shaderProgram = createFinalShaderProgram(gl, vsSource, fsSource);
		}
	};

	// Create the GUI.
	var gui = new dat.GUI();
	gui.add(controller, 'text');
	gui.add(controller, 'offsetZ', -20.0, 20.0);
	gui.addColor(controller, 'color0');
	gui.addColor(controller, 'color1');
	gui.add(controller, 'update');

	// Start rendering.
	var startTime = Date.now();
	var loop = function() {
		// Clear the canvas.
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Bind the square buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, squareBuffer);
		gl.vertexAttribPointer(shaderProgram.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(shaderProgram.attribLocations.vertexPosition);

		// Use the shader program.
		gl.useProgram(shaderProgram.program);

		// Pass all uniforms.
		gl.uniform2f(shaderProgram.uniformLocations.iResolution, canvas.width, canvas.height);
		gl.uniform1f(shaderProgram.uniformLocations.iTime, (Date.now() - startTime) / 1000.0);
		gl.uniform1f(shaderProgram.uniformLocations.iOffsetZ, controller.offsetZ);
		gl.uniform3f(shaderProgram.uniformLocations.iColor0, controller.color0[0] / 255.0, controller.color0[1] / 255.0, controller.color0[2] / 255.0);
		gl.uniform3f(shaderProgram.uniformLocations.iColor1, controller.color1[0] / 255.0, controller.color1[1] / 255.0, controller.color1[2] / 255.0);

		// Draw the square.
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		// Repeat.
		requestAnimationFrame(loop);
	};

	loop();
}

window.onload = main;