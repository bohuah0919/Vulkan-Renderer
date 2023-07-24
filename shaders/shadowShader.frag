#version 450
layout(location = 0) in vec4 fragPosition;
layout(location = 0) out vec4 outColor;

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

vec4 pack (float depth) {
    vec4 rgbaDepth = fract(depth * vec4(1.0, 255.0, 255.0 * 255.0, 255.0 * 255.0 * 255.0));
    rgbaDepth -= rgbaDepth.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
    return rgbaDepth;
}

void main() {
    outColor = vec4(vec3(fragPosition.z,fragPosition.z,fragPosition.z)/fragPosition.w,1.0);
    outColor = pack((fragPosition.z - light.zNear) / (light.zFar- light.zNear));
}