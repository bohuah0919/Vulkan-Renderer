#version 450

layout(binding = 0) uniform LightMVP {
    mat4 model;
    mat4 view;
    mat4 proj;
    vec3 light_position;
    vec3 light_emit;
    vec3 camera_position;
    float zNear;
    float zFar;
}light;

layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec3 inColor;
layout(location = 2) in vec3 inNormal;
layout(location = 3) in vec2 inTexCoord;
layout(location = 4) in int inTexIdx;
layout(location = 5) in vec3 uKs;

layout(location = 0) out vec4 fragPosition;

void main() {
    vec4 position =  light.model * vec4(inPosition, 1.0);
    gl_Position =  light.proj * light.view * position;
    fragPosition = light.proj * light.view * light.model * vec4(inPosition, 1.0);
}