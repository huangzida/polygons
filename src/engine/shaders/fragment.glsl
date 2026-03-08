#version 300 es
precision highp float;

in vec3 vColor;
in float vAlpha;
in float vDistanceFromCenter;
in float vGlow;
in float vInstanceIndex;
in float vRevealAlpha;

uniform float uLineWidth;
uniform float uAntialias; // 0 or 1
uniform float uBackgroundOpacity;
uniform float uFillOpacity;

out vec4 fragColor;

void main() {
    // 基础颜色
    vec3 finalColor = vColor;
    float finalAlpha = vAlpha;
    
    // 添加发光效果
    finalColor += vec3(vGlow);
    finalAlpha += vGlow * 0.5;
    
    // 应用reveal动画
    finalAlpha *= vRevealAlpha;
    
    // 确保颜色值在有效范围内
    finalColor = clamp(finalColor, 0.0, 1.0);
    finalAlpha = clamp(finalAlpha, 0.0, 1.0);
    
    // 背景透明度叠加
    finalAlpha = mix(finalAlpha, 1.0, uBackgroundOpacity);
    
    fragColor = vec4(finalColor, finalAlpha);
}