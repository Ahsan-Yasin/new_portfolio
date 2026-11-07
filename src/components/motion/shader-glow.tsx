'use client';

import { useEffect, useRef } from 'react';
import { useMotionLevel } from './motion-provider';

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAGMENT = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c;uniform vec2 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){
vec2 u=gl_FragCoord.xy/r;vec2 q=u;q.x*=r.x/r.y;
float f=fbm(q*1.5+vec2(t*.06,-t*.05));
f=fbm(q*1.7+f*1.8+vec2(-t*.04,t*.07));
float a=length((u-o)*vec2(1.,1.15));
float b=distance(u,m);
float mask=smoothstep(.95,.05,a)+.45*smoothstep(.45,.0,b);
vec3 col=c*pow(f,1.7)*mask*2.1;
col+=(h(gl_FragCoord.xy+t)-.5)*.035;
gl_FragColor=vec4(col,1.);}`;

function hexToRgb(hex: string) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16) / 255);
}

/**
 * A living glow in the accent colour, for dark sections. It's a single small shader
 * with no 3D library, rendered at low resolution and paused whenever it's off screen.
 */
export function ShaderGlow({ origin = [0.85, 0.05] }: { origin?: [number, number] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const level = useMotionLevel();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) {
      canvas.style.display = 'none';
      return;
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.style.display = 'none';
      return;
    }
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      r: gl.getUniformLocation(program, 'r'),
      t: gl.getUniformLocation(program, 't'),
      m: gl.getUniformLocation(program, 'm'),
      c: gl.getUniformLocation(program, 'c'),
      o: gl.getUniformLocation(program, 'o'),
    };

    const accent = getComputedStyle(canvas).getPropertyValue('--accent').trim() || '#ff4d1f';
    gl.uniform3fv(uniforms.c, hexToRgb(accent));
    gl.uniform2f(uniforms.o, origin[0], origin[1]);

    const resize = () => {
      const scale = 0.5;
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.r, canvas.width, canvas.height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const pointer = { x: origin[0], y: origin[1], tx: origin[0], ty: origin[1] };
    const onMove = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - box.left) / box.width;
      pointer.ty = 1 - (event.clientY - box.top) / box.height;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const still = level !== 'full' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = true;
    const start = performance.now();
    const draw = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      gl.uniform1f(uniforms.t, still ? 12 : (now - start) / 1000);
      gl.uniform2f(uniforms.m, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = visible && !still ? requestAnimationFrame(draw) : 0;
    };
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(draw);
    });
    visibility.observe(canvas);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onMove);
    };
  }, [level, origin]);

  return (
    <div aria-hidden className="glow-fallback pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
