"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { daylight, stageFocus } from "@/lib/daylight";
import { CAB, H, LAMPS, PARTS, WALLBOX, WireId, type PartKey } from "./layout";
import { FOCUS_PRESET, type PresetId } from "./presets";
import { buildGeometries, buildWindowParts } from "./house";
import { createMaterials } from "./materials";
import { createWireMaterial } from "./flow";
import { PART_KEYS, WIRE_IDS, initialRigState, setEnvironment, stepFrame, makeHoverProps, type RigEnv } from "./rig";
import { contactShadow, skyTexture } from "./textures";

export interface HouseStageProps {
  className?: string;
  /** Wird nach den ersten gerenderten Frames einmal aufgerufen. */
  onReady?: () => void;
  /** Feste Ansicht (Renderings): ignoriert den Fokus-Store, Kamera sofort, keine Animation. */
  preset?: PresetId;
  /** Beschriftungen anzeigen (Standard: ja). */
  labels?: boolean;
  /** Nur mit `preset`: "hero" = Motiv rechts wie auf der Startseite, sonst mittig. */
  layout?: "centered" | "hero";
}

interface Env extends RigEnv {
  fine: boolean;
}

type LabelRefs = { current: Record<PartKey, HTMLElement | null> };

function readEnv(fixed: boolean, labels: boolean, layout?: string): Env {
  const mq = (q: string) => window.matchMedia(q).matches;
  const reduced = mq("(prefers-reduced-motion: reduce)") || fixed;
  return {
    mobile: !fixed && (mq("(pointer: coarse)") || window.innerWidth < 768),
    reduced,
    snap: reduced,
    labels,
    centered: fixed && layout !== "hero",
    fine: !fixed && mq("(pointer: fine)") && mq("(hover: hover)"),
  };
}

function Scene({ env, onReady, preset, labelRefs }: { env: Env; onReady?: () => void; preset?: PresetId; labelRefs: LabelRefs }) {
  const { gl, scene, camera, size, invalidate } = useThree();

  const kit = useMemo(() => {
    const g = buildGeometries();
    const win = buildWindowParts();
    const m = createMaterials(g.pvW / g.pvLen);
    const wireMats = {} as Record<WireId, ReturnType<typeof createWireMaterial>>;
    WIRE_IDS.forEach((id) => {
      wireMats[id] = createWireMaterial(g.wires[id].length, env.mobile ? 1.8 : 1.3);
    });
    const shadow = contactShadow();
    const shadowCatcher = new THREE.ShadowMaterial({
      opacity: 0.32,
      color: new THREE.Color("#2a1f38"),
      transparent: true,
    });
    shadowCatcher.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace("void main() {", "varying vec2 vLocal;\nvoid main() {")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\n vLocal = position.xy;");
      sh.fragmentShader = sh.fragmentShader
        .replace("void main() {", "varying vec2 vLocal;\nvoid main() {")
        .replace(
          "opacity * ( 1.0 - getShadowMask() )",
          "opacity * ( 1.0 - getShadowMask() ) * (1.0 - smoothstep(7.0, 15.0, length(vLocal)))",
        );
    };
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadow.texture,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    });
    const sky = skyTexture();
    const lampMats = [0, 1, 2].map(() => m.lamp.clone());
    const edgeMat = new THREE.LineBasicMaterial({ color: "#15171c", transparent: true, opacity: 0.2 });
    const edges = {
      roof: new THREE.EdgesGeometry(g.roof, 28),
      south: new THREE.EdgesGeometry(g.south, 28),
      north: new THREE.EdgesGeometry(g.north, 28),
      cpRoof: new THREE.EdgesGeometry(g.cpRoof, 28),
    };
    const lampGeo = new THREE.SphereGeometry(0.13, 20, 14);
    const statusGeo = new THREE.CircleGeometry(0.025, 12);
    const ledGeo = new THREE.CircleGeometry(0.035, 16);
    return { g, win, m, wireMats, shadow, shadowCatcher, contactMat, sky, lampMats, edgeMat, edges, lampGeo, statusGeo, ledGeo };
  }, [env.mobile]);

  // Ressourcen freigeben
  useEffect(() => {
    return () => {
      const { g, win, m, wireMats, shadow, shadowCatcher, contactMat, sky, lampMats, edgeMat, edges, lampGeo, statusGeo, ledGeo } = kit;
      const geos: THREE.BufferGeometry[] = [
        g.south, g.north, g.west, g.plinth, g.slab, g.ceil, g.gableE, g.gableW, g.roof, g.pvGeom, g.cpRoof, g.cpBack,
        g.cpPad, g.pathPad, g.wallbox, g.cab, g.pedestal, g.pedCap, g.junction, ...g.posts, ...g.cut,
        ...WIRE_IDS.map((id) => g.wires[id].geometry),
        win.frames, win.glass, win.glow, ...Object.values(edges), lampGeo, statusGeo, ledGeo,
        g.doorGeom, g.cable, g.car.body, g.car.windows, g.car.wheels, g.car.hubs, g.outlets.plates, g.outlets.dots,
        g.contours.pv.geo, g.contours.verteiler.geo, g.contours.wallbox.geo, g.contours.netz.geo,
      ];
      geos.forEach((x) => x.dispose());
      const mats: THREE.Material[] = [
        m.plaster, m.interior, m.roof, m.pad, m.slate, m.frame, m.glass, m.pvTop, m.lamp, m.glow, m.status,
        m.car, m.carGlass, m.cable, m.led, ...Object.values(m.contours), ...(m.door as THREE.Material[]),
        ...(m.pv as THREE.Material[]), ...(m.cab as THREE.Material[]),
        ...Object.values(wireMats), ...lampMats, shadowCatcher, contactMat, edgeMat,
      ];
      mats.forEach((x) => x.dispose());
      m.textures.forEach((t) => t.dispose());
      shadow.texture.dispose();
      sky.dispose();
    };
  }, [kit]);

  // Umgebung für Reflexionen
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const rt = pm.fromEquirectangular(kit.sky);
    setEnvironment(scene, rt.texture);
    pm.dispose();
    invalidate();
    return () => {
      setEnvironment(scene, null);
      rt.dispose();
    };
  }, [gl, scene, kit.sky, invalidate]);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const lampA = useRef<THREE.PointLight>(null);
  const lampB = useRef<THREE.PointLight>(null);

  const rig = useRef(initialRigState(preset ?? FOCUS_PRESET[stageFocus.get()]));
  const doorRef = useRef<THREE.Group>(null);

  // Fokus-Choreografie (nicht bei festen Renderings)
  useEffect(() => {
    if (preset) return;
    const r = rig.current;
    r.preset = FOCUS_PRESET[stageFocus.get()];
    return stageFocus.subscribe((f) => {
      r.preset = FOCUS_PRESET[f];
      invalidate();
    });
  }, [preset, invalidate]);

  const hoverProps = useMemo(
    // Ref wird nur lazy in den Handlern gelesen, nicht im Render.
    // eslint-disable-next-line react-hooks/refs
    () => makeHoverProps(rig, gl.domElement, env.fine, invalidate),
    [rig, gl, env.fine, invalidate],
  );

  // Pointer-Parallax (nur feiner Zeiger, nicht bei reduced motion)
  useEffect(() => {
    if (!env.fine || env.reduced) return;
    const r = rig.current;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      r.px = (e.clientX / window.innerWidth) * 2 - 1;
      r.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [env.fine, env.reduced]);

  // Bei reduced motion (frameloop demand) nur bei Stundenwechsel neu rendern
  useEffect(() => daylight.subscribe(() => invalidate()), [invalidate]);

  // frameloop "demand": die ersten Frames anstoßen, bis sie wirklich gerendert wurden
  useEffect(() => {
    if (!env.reduced) return;
    const r = rig.current;
    let n = 0;
    const id = window.setInterval(() => {
      invalidate();
      if (r.frames >= 4 || ++n > 150) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [env.reduced, invalidate]);

  useFrame((_, dt) => {
    stepFrame({
      dt,
      env,
      state: rig.current,
      camera: camera as THREE.PerspectiveCamera,
      scene,
      size,
      sun: sunRef.current,
      fill: fillRef.current,
      hemi: hemiRef.current,
      lampA: lampA.current,
      lampB: lampB.current,
      doorPivot: doorRef.current,
      labels: labelRefs.current,
      kit,
    });
    if (rig.current.frames === 3) onReady?.();
  });

  const { g, win, m, edges, edgeMat, lampMats, lampGeo, statusGeo, ledGeo } = kit;
  const ct = g.contours;
  const shadowRes = env.mobile ? 1024 : 2048;
  const lampPos = (p: readonly [number, number, number]) => [p[0], p[1], p[2] + 0.06] as [number, number, number];

  return (
    <>
      <hemisphereLight ref={hemiRef} />
      <directionalLight ref={fillRef} position={[30, 12, 26]} />
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize={[shadowRes, shadowRes]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-camera-near={1}
        shadow-camera-far={110}
        shadow-bias={-0.0006}
        shadow-normalBias={0.05}
        shadow-radius={env.mobile ? 2 : 4}
      />
      <pointLight ref={lampA} color="#ffb040" position={[2.2, 2.2, -1.4]} distance={9} decay={2} />
      <pointLight ref={lampB} color="#ffb040" position={[1.8, 4.5, -1.4]} distance={9} decay={2} />

      {/* Boden: Kontaktschatten + Schattenfänger (laufen aus) */}
      <mesh rotation-x={-Math.PI / 2} position={[kit.shadow.cx, 0.004, kit.shadow.cz]} material={kit.contactMat} renderOrder={1}>
        <planeGeometry args={[kit.shadow.w, kit.shadow.d]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[3, 0.006, -1]} receiveShadow material={kit.shadowCatcher} renderOrder={2}>
        <planeGeometry args={[44, 44]} />
      </mesh>

      {/* Haus */}
      <group>
        <mesh geometry={g.plinth} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.south} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.north} material={m.interior} castShadow receiveShadow />
        <mesh geometry={g.west} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.slab} material={m.interior} castShadow receiveShadow />
        <mesh geometry={g.ceil} material={m.interior} castShadow receiveShadow />
        <mesh geometry={g.gableE} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.gableW} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.roof} material={m.roof} castShadow receiveShadow />
        {g.cut.map((c, i) => (
          <mesh key={i} geometry={c} material={m.slate} />
        ))}
        <lineSegments geometry={edges.roof} material={edgeMat} />
        <mesh geometry={win.frames} material={m.frame} castShadow receiveShadow />
        <mesh geometry={win.glass} material={m.glass} renderOrder={3} />
        <mesh geometry={win.glow} material={m.glow} renderOrder={2} />

        {/* PV-Feld auf der Südseite */}
        <mesh
          geometry={g.pvGeom}
          material={m.pv}
          position={g.pvPos}
          rotation={[H.pitch, 0, 0]}
          castShadow
          receiveShadow
          {...hoverProps.pv}
        />
        <lineSegments geometry={ct.pv.geo} material={m.contours.pv} position={g.pvPos} rotation={[H.pitch, 0, 0]} scale={[1.012, 1.8, 1.03]} />

        {/* Verteiler */}
        <mesh geometry={g.cab} material={m.cab} castShadow receiveShadow {...hoverProps.verteiler} />
        <group ref={doorRef} position={[CAB.x - CAB.w / 2, (CAB.y0 + CAB.y1) / 2, CAB.zFront + 0.02]}>
          <mesh geometry={g.doorGeom} material={m.door} castShadow {...hoverProps.verteiler} />
        </group>
        <lineSegments geometry={ct.verteiler.geo} material={m.contours.verteiler} position={ct.verteiler.pos} scale={1.04} />
        <lineSegments geometry={ct.verteiler.geo} material={m.contours.verteiler} position={ct.verteiler.pos} scale={1.12} />
        <mesh geometry={g.outlets.plates} material={m.pad} receiveShadow />
        <mesh geometry={g.outlets.dots} material={m.slate} />
        <mesh position={[CAB.x + 0.3, CAB.y1 - 0.12, CAB.zFront + 0.002]} geometry={statusGeo} material={m.status} />

        {/* Leuchten in den Räumen */}
        {[LAMPS.wohnen, LAMPS.zimmer2, LAMPS.zimmer1].map((p, i) => (
          <mesh key={i} position={lampPos(p)} geometry={lampGeo} material={lampMats[i]} castShadow />
        ))}
      </group>

      {/* Außenanlage */}
      <mesh geometry={g.pathPad} material={m.pad} receiveShadow />
      <mesh geometry={g.pedestal} material={m.plaster} castShadow receiveShadow {...hoverProps.netz} />
      <mesh geometry={g.pedCap} material={m.slate} castShadow {...hoverProps.netz} />
      <lineSegments geometry={ct.netz.geo} material={m.contours.netz} position={ct.netz.pos} scale={1.03} />
      <lineSegments geometry={ct.netz.geo} material={m.contours.netz} position={ct.netz.pos} scale={1.07} />
      <mesh geometry={g.junction} material={m.plaster} receiveShadow />

      {/* Carport mit Wallbox */}
      <group>
        <mesh geometry={g.cpPad} material={m.pad} receiveShadow />
        {g.posts.map((p, i) => (
          <mesh key={i} geometry={p} material={m.plaster} castShadow receiveShadow />
        ))}
        <mesh geometry={g.cpRoof} material={m.roof} castShadow receiveShadow />
        <lineSegments geometry={edges.cpRoof} material={edgeMat} />
        <mesh geometry={g.cpBack} material={m.plaster} castShadow receiveShadow />
        <mesh geometry={g.wallbox} material={m.plaster} castShadow {...hoverProps.wallbox} />
        <mesh position={[WALLBOX.x, WALLBOX.y + 0.1, WALLBOX.z + 0.141]} geometry={ledGeo} material={m.led} />
        <lineSegments geometry={ct.wallbox.geo} material={m.contours.wallbox} position={ct.wallbox.pos} scale={1.12} />
        <lineSegments geometry={ct.wallbox.geo} material={m.contours.wallbox} position={ct.wallbox.pos} scale={1.3} />
        <mesh geometry={g.car.body} material={m.car} castShadow receiveShadow {...hoverProps.wallbox} />
        <mesh geometry={g.car.windows} material={m.carGlass} />
        <mesh geometry={g.car.wheels} material={m.slate} castShadow />
        <mesh geometry={g.car.hubs} material={m.frame} />
        <mesh geometry={g.cable} material={m.cable} />
      </group>

      {/* Leitungen */}
      {WIRE_IDS.map((id) => (
        <mesh key={id} geometry={g.wires[id].geometry} material={kit.wireMats[id]} />
      ))}
    </>
  );
}

export function HouseStage({ className, onReady, preset, labels = true, layout }: HouseStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<PartKey, HTMLElement | null>>({ pv: null, verteiler: null, wallbox: null, netz: null });
  const [env] = useState<Env>(() => readEnv(!!preset, labels, layout));
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const active = visible && tabVisible;
  const frameloop = !active ? "never" : env.reduced ? "demand" : "always";

  return (
    <div ref={wrapRef} className={className} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas
        aria-hidden="true"
        frameloop={frameloop}
        dpr={preset ? [3, 3] : [1, env.mobile ? 1.5 : 1.75]}
        shadows={{ enabled: true, type: THREE.PCFShadowMap }}
        camera={{ fov: 30, near: 5, far: 200 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1;
        }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Scene env={env} onReady={onReady} preset={preset} labelRefs={labelRefs} />
      </Canvas>
      {labels ? (
        <div className="stage-labels" aria-hidden="true">
          {PART_KEYS.map((key) => (
            <div
              key={key}
              ref={(el) => {
                labelRefs.current[key] = el;
              }}
              className="stage-label"
              data-state="hidden"
              data-side={PARTS[key].side}
            >
              <span className="stage-label__dot" />
              <span className="stage-label__line" />
              <span className="stage-label__pill">{PARTS[key].label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
