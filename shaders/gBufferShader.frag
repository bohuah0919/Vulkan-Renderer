#version 450

layout(location = 0) in vec4 fragPosition;
layout(location = 1) in vec3 fragColor;
layout(location = 2) in vec3 fragNormal;
layout(location = 3) in vec2 fragTexCoord;
layout(location = 4) in flat int fragTexIdx;
layout(location = 5) in vec4 lightPosition;
layout(location = 6) in vec4 lightTexCoord;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outPosition;
layout(location = 2) out vec4 outNormal;
layout(location = 3) out vec4 outVisibility;
layout(location = 4) out vec4 outDepth;

layout(binding = 0) uniform UniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
    vec3 light_position;
    vec3 light_emit;
    vec3 camera_position;
    float zNear;
    float zFar;
} ubo;

layout(binding = 1) uniform sampler2D texSampler[3];

layout(binding = 2) uniform LightUniformBufferObject {
    mat4 model;
    mat4 view;
    mat4 proj;
    vec3 light_position;
    vec3 light_emit;
    vec3 camera_position;
    float zNear;
    float zFar;
} light;

layout(binding = 3) uniform sampler2D shadowMapSampler;

vec4 pack (float depth) {
    vec4 rgbaDepth = fract(depth * vec4(1.0, 255.0, 255.0 * 255.0, 255.0 * 255.0 * 255.0));
    rgbaDepth -= rgbaDepth.yzww * vec4(1.0/255.0, 1.0/255.0, 1.0/255.0, 0.0);
    return rgbaDepth;
}

float unpack(vec4 rgbaDepth) {
    return dot(rgbaDepth, vec4(1.0, 1.0/255.0, 1.0/(255.0*255.0), 1.0/(256.0*255.0*255.0)));
}

float sampleShadowMap(sampler2D shadowMapSampler, vec4 shadow_map_coord, float bias){
    float visibility = 1.0;

    if (unpack(texture(shadowMapSampler, shadow_map_coord.xy)) < (shadow_map_coord.z - bias))
        visibility = 0.2;

    return visibility;
}

void main() {
    if (fragTexIdx >= 0)
        outColor = vec4(texture(texSampler[fragTexIdx], fragTexCoord).xyz, 1.0);
    else
        outColor = vec4(fragColor, 1.0);

    outPosition = fragPosition;
    outNormal = vec4(normalize(fragNormal), 1.0);   

    vec4 coord = lightTexCoord / lightTexCoord.w;

    vec3 light_vector = normalize(lightPosition.xyz - fragPosition.xyz);
    vec3 normal_vector = normalize(fragNormal); 
    float cos = max(0.0, dot(normal_vector, light_vector));
    float bias = max(0.005 * (1.0 - cos), 0.004); 
    vec4 shadow_map_coord = vec4(coord.xy * 0.5 + 0.5, (coord.z * lightTexCoord.w - light.zNear) / (light.zFar- light.zNear), coord.w);
    float visibility = sampleShadowMap(shadowMapSampler, shadow_map_coord, bias);

    outVisibility = vec4(vec3(visibility), 1.0); 

    vec4 screenPosition = ubo.proj * ubo.view * fragPosition;
    outDepth = pack((screenPosition.z  - ubo.zNear) / (ubo.zFar- ubo.zNear));

}