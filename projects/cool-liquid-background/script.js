const canvas = document.getElementById('liquid-canvas');
const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });

if (!gl) {
  document.body.style.background = '#0a0806';
} else {
  // Shaders
  const vertSrc = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Simplex 2D noise
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz;
      x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m;m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5;
      vec3 ox=floor(x+0.5);
      vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x=a0.x*x0.x+h.x*x0.y;
      g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }

    // Optimized FBM (3 octaves instead of 5)
    float fbm(vec2 p){
      float v=0.0;
      float a=0.5;
      for(int i=0;i<3;i++){
        v+=a*snoise(p);
        p*=2.0;
        a*=0.5;
      }
      return v;
    }

    void main(){
      vec2 res = u_resolution;
      vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);
      p *= 1.4;

      float t = u_time * 0.06;

      // Mouse position normalized
      vec2 m = (u_mouse - 0.5 * res) / min(res.x, res.y);
      m *= 1.4;
      float md = length(p - m);
      
      // Cheaper rational falloff for mouse influence
      float mInf = 0.35 / (1.0 + md * md * 8.0);

      // Simplified single-layer domain warp
      vec2 q = vec2(
        fbm(p + vec2(0.0, t)),
        fbm(p + vec2(5.2, 1.3) - t)
      );

      float f = fbm(p + 2.0 * q + mInf);

      // Color palette
      vec3 deep = vec3(0.03, 0.025, 0.02);
      vec3 papaya = vec3(1.0, 0.42, 0.05);
      vec3 ember = vec3(1.0, 0.72, 0.42);
      vec3 cream = vec3(0.96, 0.93, 0.88);

      vec3 col = deep;
      col = mix(col, papaya * 0.5, smoothstep(-0.3, 0.5, f));
      col = mix(col, ember * 0.7, smoothstep(0.2, 0.8, f) * 0.5);
      col = mix(col, cream, smoothstep(0.7, 1.0, f) * 0.2);

      // Mouse glow
      col += papaya * mInf * 1.2;
      col += ember * (0.15 / (1.0 + md * md * 40.0));

      // Vignette
      float vig = smoothstep(1.5, 0.2, length(p));
      col *= 0.35 + 0.65 * vig;

      // Gamma correction
      col = pow(col, vec3(0.9));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // Compile shaders
  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  // Full-screen triangle setup
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  // Mouse state
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let tMouseX = mouseX;
  let tMouseY = mouseY;

  // Resize handler (capped at 1.0 DPR for maximum performance)
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse listener
  window.addEventListener('mousemove', e => {
    tMouseX = e.clientX;
    tMouseY = e.clientY;
  });

  // Render loop with visibility optimization
  let isRunning = true;
  const startTime = performance.now();

  function render() {
    if (!isRunning) return;

    const t = (performance.now() - startTime) / 1000;

    // Smooth mouse interpolation
    mouseX += (tMouseX - mouseX) * 0.05;
    mouseY += (tMouseY - mouseY) * 0.05;

    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    
    // Invert Y for WebGL coordinates
    gl.uniform2f(uMouse, mouseX * (canvas.width / window.innerWidth), (window.innerHeight - mouseY) * (canvas.height / window.innerHeight));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  // Pause rendering when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
    } else if (!isRunning) {
      isRunning = true;
      requestAnimationFrame(render);
    }
  });

  // Start
  requestAnimationFrame(render);
}
