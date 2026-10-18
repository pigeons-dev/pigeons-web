"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const SPACING = 26;
const TRAIL_SIZE = 64;
const TRAIL_MAX_AGE = 90;
const TRAIL_RADIUS = 0.13;

const easeOutSine = (t: number): number => Math.sin(t * Math.PI * 0.5);

class TouchTrail {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  points: Array<{ x: number; y: number; age: number }> = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = TRAIL_SIZE;
    this.canvas.height = TRAIL_SIZE;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);
  }

  addPoint(u: number, v: number): void {
    this.points.push({ x: u, y: v, age: 0 });
  }

  update(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, TRAIL_SIZE, TRAIL_SIZE);

    this.points = this.points.filter((p) => p.age < TRAIL_MAX_AGE);

    for (const point of this.points) {
      point.age++;
      const life = point.age / TRAIL_MAX_AGE;
      const intensity =
        life < 0.3
          ? easeOutSine(life / 0.3)
          : easeOutSine(1 - (life - 0.3) / 0.7);

      const radius = TRAIL_SIZE * TRAIL_RADIUS * intensity;
      const cx = point.x * TRAIL_SIZE;
      const cy = point.y * TRAIL_SIZE;
      if (radius <= 0) continue;

      const grd = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grd.addColorStop(0, `rgba(255,255,255,${0.35 * intensity})`);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      this.ctx.fillStyle = grd;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}

const VERTEX = /* glsl */ `
  attribute float aRnd;
  attribute float aAngle;
  attribute vec2 aUv;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform sampler2D uTouch;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = texture2D(uTouch, aUv).r;

    float push = t * 34.0 * (0.4 + aRnd);
    p.x += cos(aAngle) * push;
    p.y += sin(aAngle) * push;

    p.x += sin(uTime * 0.55 + aRnd * 6.2831) * 1.6;
    p.y += cos(uTime * 0.45 + aRnd * 6.2831) * 1.6;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + aRnd * 1.6 + t * 4.5) * uPixelRatio;
    vAlpha = 0.10 + aRnd * 0.10 + t * 0.5;
  }
`;

// purple-tinted particles: rgb(101, 110, 232) = vec3(0.396, 0.431, 0.910)
const FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float circle = smoothstep(0.5, 0.32, d);
    gl_FragColor = vec4(vec3(0.396, 0.431, 0.910), circle * vAlpha);
  }
`;

export function PigeonField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion !== false) return;
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -100, 100);

    const trail = new TouchTrail();
    const touchTexture = new THREE.CanvasTexture(trail.canvas);

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uTouch: { value: touchTexture },
      },
    });

    let points: THREE.Points | null = null;

    const buildField = (width: number, height: number): void => {
      if (points) {
        points.geometry.dispose();
        scene.remove(points);
      }

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      const count = cols * rows;

      const positions = new Float32Array(count * 3);
      const rnds = new Float32Array(count);
      const angles = new Float32Array(count);
      const uvs = new Float32Array(count * 2);

      let i = 0;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          positions[i * 3] = x * SPACING;
          positions[i * 3 + 1] = height - y * SPACING;
          positions[i * 3 + 2] = 0;
          rnds[i] = Math.random();
          angles[i] = Math.random() * Math.PI * 2;
          uvs[i * 2] = (x * SPACING) / width;
          uvs[i * 2 + 1] = 1 - (y * SPACING) / height;
          i++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aRnd", new THREE.BufferAttribute(rnds, 1));
      geometry.setAttribute("aAngle", new THREE.BufferAttribute(angles, 1));
      geometry.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));

      points = new THREE.Points(geometry, material);
      scene.add(points);
    };

    const resize = (): void => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.right = width;
      camera.top = height;
      camera.updateProjectionMatrix();
      buildField(width, height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const onPointerMove = (e: PointerEvent): void => {
      const rect = container.getBoundingClientRect();
      const u = (e.clientX - rect.left) / rect.width;
      const v = (e.clientY - rect.top) / rect.height;
      if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
        trail.addPoint(u, v);
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const start = performance.now();
    let frame = 0;
    const tick = (): void => {
      trail.update();
      touchTexture.needsUpdate = true;
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (points) {
        points.geometry.dispose();
        scene.remove(points);
      }
      material.dispose();
      touchTexture.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  if (reducedMotion !== false) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
