# Vortext
Vortext is a raymarched font written in Javascript and GLSL. It supports the full alphabet (lowercase and uppercase) and all digits. Support for the full printable ASCII set is planned but not yet supported.

![Alt text](https://github.com/CobaltXII/vortext/blob/master/banner.png?raw=true)

# How it works
Vortext uses a form of raytracing called raymarching. Instead of solving intersections with primitives analytically (which is slow), signed distance functions are used which provide the minimum distance from a point to a shape. Using this, we can step along the ray's path and return an intersection when the distance to any shape is approximately equal to zero.
All glyphs in the Vortext font are made from spheres, capsules and tori. The tori may be cut into halves or quarters, however.
The cool 90's demoscene look is achieved using a form of [gradient noise](https://www.shadertoy.com/view/Xsl3Dl) (written by Inigo Quilez).

# Try it out
A live demo will be up soon.

# Inspiration
Vortext was inspired by Mark Zucker's [miniray raymarcher](https://mzucker.github.io/2016/08/03/miniray.html).

# Testing
Inigo Quilez's [Shadertoy](https://www.shadertoy.com/) was extremely useful while creating Vortext. The original shader used to develop Vortext is still available [here](https://www.shadertoy.com/view/tdy3zW).

# Credits
Thanks to Mark Zucker, Inigo Quilez and mathmasterzach#1551.