
# create-react-app doesn't support ES6 code in node_modules.
# The easiest workaround is to copy the files somewhere into src/
cp ../../node_modules/gl-matrix/src/gl-matrix/{common,vec4,mat4}.js .


# We could instead use the bundled version of gl-matrix, but that includes 50k of stuff we don't need.
