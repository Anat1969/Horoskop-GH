import { useEffect, useRef, useState } from 'react';

// בניין בקו דיו שקם מהדף, עם צל אמיתי מהשמש של המנוע. Three.js נטען רק כשהדף נפתח.
interface Props { alt: number; az: number; height: number; lifted: boolean; label: string }
type Three = typeof import('three');

export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function ShadowScene({ alt, az, height, lifted, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<{ update: (alt: number, az: number, lifted: boolean) => void } | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) { setFailed(true); return; }
    let disposed = false, raf = 0;
    let cleanup = () => {};
    Promise.all([import('three'), import('three/examples/jsm/controls/OrbitControls.js')]).then(([THREE, { OrbitControls }]: [Three, typeof import('three/examples/jsm/controls/OrbitControls.js')]) => {
      if (disposed || !host.current) return;
      const el = host.current;
      const W = el.clientWidth, H = el.clientHeight;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.setSize(W, H);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);
      camera.position.set(34, 30, 40);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 3, -6); controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 25; controls.maxDistance = 110;
      controls.update();

      // הדף: נייר עם רשת דקה כל 5 מטר
      const paper = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshLambertMaterial({ color: 0xfbfaf6 }));
      paper.rotation.x = -Math.PI / 2; paper.receiveShadow = true; scene.add(paper);
      const grid = new THREE.GridHelper(60, 12, 0xd8d8d8, 0xe9e9e9); grid.position.y = 0.01; scene.add(grid);
      // חץ צפון
      const north = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(24, 0.05, -10), 6, 0x111111, 1.4, 0.9); scene.add(north);

      // המגדל: לבן עם קווי מתאר בדיו
      const geo = new THREE.BoxGeometry(2.4, height, 2.4); geo.translate(0, height / 2, 0);
      const tower = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }));
      tower.castShadow = true; tower.receiveShadow = true;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x111111 }));
      const building = new THREE.Group(); building.add(tower, edges); scene.add(building);

      // שמש, קרן וסרגל הצל
      const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 });
      scene.add(sun, new THREE.AmbientLight(0xffffff, 1.1));
      const sunBall = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 16), new THREE.MeshBasicMaterial({ color: 0xe0542a }));
      scene.add(sunBall);
      const rayMat = new THREE.LineDashedMaterial({ color: 0xe0542a, dashSize: 0.8, gapSize: 0.5 });
      const ray = new THREE.Line(new THREE.BufferGeometry(), rayMat); scene.add(ray);
      const ruler = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(ruler);
      const ticks = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x111111 })); scene.add(ticks);

      let lift = 0, liftTarget = 0;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const R = Math.PI / 180;
      const update = (a: number, z: number, l: boolean) => {
        liftTarget = l ? 1 : 0.02; if (reduce) lift = liftTarget;
        const h = Math.max(0.5, a) * R, A = z * R;
        const dir = new THREE.Vector3(-Math.cos(h) * Math.sin(A), Math.sin(h), Math.cos(h) * Math.cos(A)).normalize();
        sun.position.copy(dir.clone().multiplyScalar(80)); sun.target.position.set(0, 0, 0); sun.target.updateMatrixWorld();
        sunBall.position.copy(dir.clone().multiplyScalar(34)); sunBall.visible = a > 0;
        const len = Math.min(40, height / Math.tan(h));
        const sd = new THREE.Vector3(-dir.x, 0, -dir.z).normalize();
        const tip = sd.clone().multiplyScalar(len).setY(0.06);
        const top = new THREE.Vector3(0, height, 0);
        ray.geometry.setFromPoints([sunBall.position, top, tip]); ray.computeLineDistances(); ray.visible = l && a > 0;
        ruler.geometry.setFromPoints([new THREE.Vector3(0, 0.06, 0), tip]); ruler.visible = l && a > 0;
        const side = new THREE.Vector3(-sd.z, 0, sd.x).multiplyScalar(0.6), pts: InstanceType<Three['Vector3']>[] = [];
        for (let m = 5; m < len; m += 5) { const p = sd.clone().multiplyScalar(m).setY(0.06); pts.push(p.clone().add(side), p.clone().sub(side)); }
        pts.push(tip.clone().add(side.clone().multiplyScalar(1.6)), tip.clone().sub(side.clone().multiplyScalar(1.6)));
        ticks.geometry.setFromPoints(pts); ticks.visible = l && a > 0;
      };
      api.current = { update };
      const loop = () => {
        lift += (liftTarget - lift) * 0.08; building.scale.y = Math.max(0.02, lift);
        controls.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop);
      };
      loop();
      const onResize = () => { const w = el.clientWidth, hh = el.clientHeight; renderer.setSize(w, hh); camera.aspect = w / hh; camera.updateProjectionMatrix(); };
      window.addEventListener('resize', onResize);
      setReady(true);
      cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); controls.dispose(); renderer.dispose(); el.innerHTML = ''; };
    }).catch(() => setFailed(true));
    return () => { disposed = true; cleanup(); };
  }, [height]);

  useEffect(() => { api.current?.update(alt, az, lifted); }, [alt, az, lifted, ready]);

  if (failed) return null;
  return <div ref={host} className="scene3d" role="img" aria-label={label} />;
}
