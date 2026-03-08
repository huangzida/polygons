#version 300 es
in vec3 position;
in vec3 color;
in float instanceIndex; // 0..count-1
in float rotationOffset; // 每个实例的旋转偏移

uniform float uTime;
uniform float uRotationSpeed;
uniform float uRotationIncrement;
uniform float uScale;
uniform float uCount; // 实例总数
uniform float uSpacing;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform float uLineWidth;
uniform float uLineOpacity;
uniform float uGlowIntensity;
uniform float uAspect;
uniform float uRotationDirection; // 1 = outward, -1 = inward, 0 = alternating
uniform float uAnimateScale;
uniform float uScaleSpeed;
uniform float uPulseFrequency;
uniform float uBackgroundOpacity;
uniform float uFillOpacity;
uniform float uRevealMode; // 0=none, 1=centerOut, 2=centerIn, 3=sequential
uniform float uRevealSpeed;

out vec3 vColor;
out float vAlpha;
out float vDistanceFromCenter;
out float vGlow;
out float vInstanceIndex;
out float vRevealAlpha;

const float PI = 3.14159265359;

void main() {
    // 计算实例半径（从内到外）
    float count = float(gl_InstanceID); // 实例索引
    float totalCount = uCount; // 实例总数
    float t = instanceIndex / max(totalCount - 1.0, 1.0);
    float radius = mix(uInnerRadius, uOuterRadius, t) * uSpacing;

    // 计算实例旋转
    float baseRotation = uTime * uRotationSpeed;
    float direction = uRotationDirection;
    if (direction == 0.0) {
        // alternating: 奇数向内，偶数向外
        direction = mod(instanceIndex, 2.0) == 0.0 ? 1.0 : -1.0;
    }
    float rotation = baseRotation * direction + rotationOffset * uRotationIncrement;

    // 动画缩放
    float scale = uScale;
    if (uAnimateScale > 0.5) {
        float pulse = sin(uTime * uScaleSpeed * 2.0 + instanceIndex * 0.5) * 0.1 + 1.0;
        scale *= pulse;
    }

    // 多边形顶点位置（在模型空间）
    // position.x 和 position.y 已经是 cos(angle) 和 sin(angle)
    // 我们需要旋转这个位置
    float cosRot = cos(rotation);
    float sinRot = sin(rotation);
    vec2 rotatedPos = vec2(
        position.x * cosRot - position.y * sinRot,
        position.x * sinRot + position.y * cosRot
    );
    vec2 pos = rotatedPos * radius * scale;

    // 应用长宽比校正
    pos.x /= uAspect;

    // 输出到裁剪空间
    gl_Position = vec4(pos, 0.0, 1.0);

    // 传递到片段着色器的变量
    vColor = color;
    vAlpha = uLineOpacity;
    vDistanceFromCenter = length(pos);
    vInstanceIndex = instanceIndex;
    
    // 发光效果：边缘更亮
    float edge = 1.0 - abs(position.y); // 使用y作为边的序号
    vGlow = uGlowIntensity * (0.5 + 0.5 * sin(uTime * uPulseFrequency + instanceIndex * 2.0 + edge * 5.0));
    
    // Reveal动画
    vRevealAlpha = 1.0;
    if (uRevealMode > 0.5) {
        float revealTime = uTime * uRevealSpeed;
        float totalCount = max(uCount - 1.0, 1.0);
        
        if (uRevealMode < 1.5) {
            // centerOut: 从中心向外显示
            float revealProgress = mod(revealTime, totalCount + 1.0);
            vRevealAlpha = smoothstep(revealProgress - 1.0, revealProgress, instanceIndex);
        } else if (uRevealMode < 2.5) {
            // centerIn: 从外向内显示
            float revealProgress = mod(revealTime, totalCount + 1.0);
            vRevealAlpha = 1.0 - smoothstep(revealProgress - 1.0, revealProgress, totalCount - instanceIndex);
        } else {
            // sequential: 依次显示
            float revealProgress = mod(revealTime, totalCount + 1.0);
            vRevealAlpha = smoothstep(revealProgress - 1.0, revealProgress, instanceIndex);
        }
    }
}