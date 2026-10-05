(function (THREE) {

const canvas = document.getElementById("ringCanvas");

if (canvas && THREE) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    function createStudioEnvironment() {
        const environmentCanvas = document.createElement("canvas");
        environmentCanvas.width = 1024;
        environmentCanvas.height = 512;
        const context = environmentCanvas.getContext("2d");
        const base = context.createLinearGradient(0, 0, 0, 512);
        base.addColorStop(0, "#b7a995");
        base.addColorStop(0.16, "#39332b");
        base.addColorStop(0.52, "#101010");
        base.addColorStop(0.82, "#29251f");
        base.addColorStop(1, "#a0927b");
        context.fillStyle = base;
        context.fillRect(0, 0, 1024, 512);

        [92, 304, 720, 906].forEach((x, index) => {
            const width = index % 2 === 0 ? 54 : 30;
            const reflection = context.createLinearGradient(x, 0, x + width, 0);
            reflection.addColorStop(0, "rgba(255,255,255,0)");
            reflection.addColorStop(0.35, index % 2 === 0 ? "rgba(255,246,222,.92)" : "rgba(255,255,255,.72)");
            reflection.addColorStop(0.7, "rgba(255,255,255,.9)");
            reflection.addColorStop(1, "rgba(255,255,255,0)");
            context.fillStyle = reflection;
            context.fillRect(x, 74, width, 250);
        });

        const texture = new THREE.CanvasTexture(environmentCanvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.environment = texture;
    }

    function createBandProfile(radius, width, thickness) {
        const innerRadius = radius - thickness;
        const halfWidth = width / 2;
        const bevel = Math.min(thickness * 0.38, width * 0.09);
        const points = [new THREE.Vector2(innerRadius + bevel, -halfWidth)];

        function addArc(centerX, centerY, start, end) {
            const segments = 6;
            for (let index = 0; index <= segments; index += 1) {
                const angle = start + (end - start) * (index / segments);
                points.push(new THREE.Vector2(
                    centerX + Math.cos(angle) * bevel,
                    centerY + Math.sin(angle) * bevel
                ));
            }
        }

        addArc(radius - bevel, -halfWidth + bevel, -Math.PI / 2, 0);
        addArc(radius - bevel, halfWidth - bevel, 0, Math.PI / 2);
        points.push(new THREE.Vector2(innerRadius + bevel, halfWidth));
        addArc(innerRadius + bevel, halfWidth - bevel, Math.PI / 2, Math.PI);
        addArc(innerRadius + bevel, -halfWidth + bevel, Math.PI, Math.PI * 1.5);
        points.push(points[0].clone());

        return new THREE.LatheGeometry(points, 192);
    }

    function createRing({ radius, width, thickness, color, position, phase, gemstone = false }) {
        const group = new THREE.Group();
        group.position.set(...position);
        group.rotation.x = 0.86;
        group.rotation.z = phase * 0.11;
        group.userData.phase = phase;
        group.userData.basePosition = position;

        const band = new THREE.Mesh(
            createBandProfile(radius, width, thickness),
            new THREE.MeshPhysicalMaterial({
                color,
                metalness: 0.96,
                roughness: 0.17,
                envMapIntensity: 1.65,
                clearcoat: 1,
                clearcoatRoughness: 0.12
            })
        );
        band.rotation.x = Math.PI / 2;
        group.add(band);

        if (gemstone) {
            const diamond = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.055, 0),
                new THREE.MeshPhysicalMaterial({
                    color: 0xe6f4ff,
                    metalness: 0.05,
                    roughness: 0.06,
                    transmission: 0.35,
                    thickness: 0.35,
                    ior: 2.1,
                    clearcoat: 1
                })
            );
            diamond.position.set(0, radius + thickness * 0.45, 0.025);
            diamond.rotation.set(0.25, 0.2, 0.35);
            group.add(diamond);
        }

        scene.add(group);
        return group;
    }

    createStudioEnvironment();
    scene.add(new THREE.HemisphereLight(0xfff0cf, 0x17120b, 0.8));

    const keyLight = new THREE.DirectionalLight(0xffe5a8, 3.4);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.6);
    rimLight.position.set(4, 1.5, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xfff4d8, 28, 10);
    fillLight.position.set(0, -2, 3);
    scene.add(fillLight);

    const kingRing = createRing({
        radius: 0.82,
        width: 0.17,
        thickness: 0.045,
        color: 0xd3a747,
        position: [-0.31, 0.02, 0],
        phase: 0
    });

    const queenRing = createRing({
        radius: 0.68,
        width: 0.105,
        thickness: 0.035,
        color: 0xf1d990,
        position: [0.31, -0.015, 0.13],
        phase: 2.1,
        gemstone: true
    });

    function resizeRenderer() {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const visibleWidth = visibleHeight * camera.aspect;
        const scale = Math.min(1, visibleWidth / 3.2 * 0.9);

        [kingRing, queenRing].forEach((ring) => {
            ring.scale.setScalar(scale);
            ring.position.set(...ring.userData.basePosition.map((value) => value * scale));
        });
    }

    window.addEventListener("resize", resizeRenderer, { passive: true });
    resizeRenderer();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = new THREE.Clock();
    let animationFrameId = 0;
    let animationStopped = false;

    entryScreen.addEventListener("transitionend", (event) => {
        if (event.propertyName !== "transform" || !entryScreen.classList.contains("opened")) return;

        animationStopped = true;
        window.cancelAnimationFrame(animationFrameId);
    });

    function render() {
        if (animationStopped) return;

        const elapsed = clock.getElapsedTime();
        [kingRing, queenRing].forEach((ring) => {
            const phase = ring.userData.phase;
            ring.rotation.y = elapsed * 0.28 + phase;
            ring.rotation.x = 0.86 + Math.sin(elapsed * 0.52 + phase) * 0.12;
            ring.rotation.z = phase * 0.11 + Math.sin(elapsed * 0.38 + phase) * 0.045;
        });

        renderer.render(scene, camera);

        if (!reducedMotion.matches) {
            animationFrameId = window.requestAnimationFrame(render);
        }
    }

    render();
}
})(window.THREE);