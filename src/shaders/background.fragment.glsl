uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uVelocity;
uniform sampler2D uVideoTexture;
varying vec2 vUv;

void main() {
    // Screen coordinates
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 aspectSt = vec2(st.x * aspect, st.y);

    // Convert mouse coordinates [-1, 1] to UV aspect space
    vec2 normMouse = uMouse * 0.5 + 0.5;
    vec2 aspectMouse = vec2(normMouse.x * aspect, normMouse.y);

    // Distance to pointer cursor
    float dist = length(aspectSt - aspectMouse);

    // Mouse velocity speed for dynamic force scaling
    float speed = length(uVelocity);
    float force = exp(-dist * 2.0) * (0.06 + clamp(speed * 0.12, 0.0, 0.10));

    // Direction vector outward from cursor
    vec2 dir = normalize(aspectSt - aspectMouse + vec2(1e-5));

    // Refractive glass wave displacement mapping
    float wave = sin(dist * 14.0 - uTime * 3.2) * force;
    vec2 mouseDisplacement = dir * wave;

    // Ambient slow organic wave drift
    vec2 ambientFlow = vec2(
        sin(st.y * 5.0 + uTime * 0.4) * 0.003,
        cos(st.x * 5.0 + uTime * 0.4) * 0.003
    );

    // Sample video texture at distorted UV coordinates
    vec2 distortedUv = clamp(st + mouseDisplacement + ambientFlow, 0.001, 0.999);
    vec4 videoColor = texture2D(uVideoTexture, distortedUv);

    // Soft specular highlight on mouse refraction wave crests
    float highlight = pow(clamp(wave * 18.0, 0.0, 1.0), 2.5) * 0.14;
    vec3 finalColor = videoColor.rgb + vec3(highlight);

    gl_FragColor = vec4(finalColor, 1.0);
}
