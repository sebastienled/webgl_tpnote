function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if (xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

var buffers = [],
    vertexPositions = [],
    vertexColors = [];

var attribPos, attribColor, TranslationUni, RotationUni, uniformPerspectiveMat, ZoomUni;
var canvas, gl, program;

var T = {
    x: 0,
    y: 0,
    z: 0,
};
var R = {
    x: 0,
    y: 0,
    z: 0,
};

var zoom = 1.0;
var FOV = 75;

function initContext() {
    canvas = document.getElementById('3dcube');
    gl = canvas.getContext('webgl');
    gl.enable(gl.DEPTH_TEST);
}

function initShaders() {
    var vertexShaderSource = loadText("vertex.glsl");
    var fragmentShaderSource = loadText("fragment.glsl");
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
}

function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
    attribColor = gl.getAttribLocation(program, "vertexColor");
    TranslationUni = gl.getUniformLocation(program, "translation");
    RotationUni = gl.getUniformLocation(program, "rotation");
    ZoomUni = gl.getUniformLocation(program, "scale");
}

function initPerspective() {
    setCanvasResolution();
    var perspectiveMat = mat4.create();
    var fieldOfView = FOV * Math.PI / 180;
    var aspect = canvas.clientWidth / canvas.clientHeight;

    mat4.perspective(perspectiveMat, fieldOfView, aspect, 0.1, 50.0);
    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

function setCanvasResolution() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function setCube() {
    vertexPositions = [
        -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0
    ];
    

    vertexColors = [
        Array(6).fill([1.0,0.0,0.0]).flat(),
        Array(6).fill([1.0,0.0,0.0]).flat(),
        Array(6).fill([1.0,1.0,0.0]).flat(),
        Array(6).fill([1.0,1.0,0.0]).flat(),
        Array(6).fill([1.0,0.65,0.0]).flat(),
        Array(6).fill([1.0,0.65,0.0]).flat(),
    ].flat();
}

function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initInputs() {
    TranslationX = document.getElementById('TranslationX');
    TranslationX.addEventListener('input', function () {
        T.x = this.value;
    });
    
    TranslationY = document.getElementById('TranslationY');
    TranslationY.addEventListener('input', function () {
        T.y = this.value;
    });

    TranslationZ = document.getElementById('TranslationZ');
    TranslationZ.addEventListener('input', function () {
        T.z = this.value;
    });

    RotationX = document.getElementById('RotationX');
    RotationX.addEventListener('input', function () {
        R.x = this.value;
    });

    RotationY = document.getElementById('RotationY');
    RotationY.addEventListener('input', function () {
        R.y = this.value;
    });

    RotationZ = document.getElementById('RotationZ');
    RotationZ.addEventListener('input', function () {
        R.z = this.value;
    });

    Zoom = document.getElementById('Zoom');
    Zoom.addEventListener('input', function () {
        zoom = this.value;
    });

    FOV = document.getElementById('FOV');
    FOV.addEventListener('input', function () {
        FOV = this.value;
        initPerspective();
    });
}

function draw() {
    refreshTransformations();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositions.length / 3);
    requestAnimationFrame(draw);
}

function initMouseEvents() {
    canvas.addEventListener('mousemove', function (e) {
        R.x = R.x - 2 * Math.PI * Math.floor((R.x + Math.PI) / (2 * Math.PI))
        R.y = R.y - 2 * Math.PI * Math.floor((R.y + Math.PI) / (2 * Math.PI))
        R.x -= (event.movementY / 100);
        R.y -= (event.movementX / 100);
        RotationX.value = R.x;
        RotationY.value = R.y;
    });
}

function refreshTransformations() {
    var Translation = mat4.create();
    var TranslationVec = vec3.fromValues(T.x, T.y, T.z - 5);

    mat4.fromTranslation(Translation, TranslationVec);
    gl.uniformMatrix4fv(TranslationUni, false, Translation);

    var Rotation = mat4.create();

    mat4.rotateX(Rotation, Rotation, -R.x);
    mat4.rotateY(Rotation, Rotation, -R.y);
    mat4.rotateZ(Rotation, Rotation, -R.z);
    gl.uniformMatrix4fv(RotationUni, false, Rotation);

    var Zoom = mat4.create();
    var ZoomVec = vec3.fromValues(zoom, zoom, zoom, 1);

    mat4.fromScaling(Zoom, ZoomVec);
    gl.uniformMatrix4fv(ZoomUni, false, Zoom);
}

function main() {
    initContext(); initShaders(); initAttributes(); initPerspective(); setCube(); initBuffers(); initInputs(); initMouseEvents(); draw();
}