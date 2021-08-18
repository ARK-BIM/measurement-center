import {math} from "../math/math.js";

const colorize = math.vec3();

/**
 * @desc Saves a snapshot of the visual state of a {@link Scene}.
 */
class SceneState {

    constructor() {

        this._camera = {
            eye: math.vec3(),
            look: math.vec3(),
            up: math.vec3(),
            projection: {}
        };

        this._objects = [];
        this._numObjects = 0;
    }

    /**
     * Saves the state of a {@link Scene}.
     * @param {Scene} scene The scene.
     */
    save(scene) {

        const camera = scene.camera;
        const project = camera.project;

        this._camera.eye.set(camera.eye);
        this._camera.look.set(camera.look);
        this._camera.up.set(camera.up);

        switch (camera.projection) {

            case "perspective":
                this._camera.projection = {
                    projection: "perspective",
                    fov: project.fov,
                    fovAxis: project.fovAxis,
                    near: project.near,
                    far: project.far
                };
                break;

            case "ortho":
                this._camera.projection = {
                    projection: "ortho",
                    scale: project.scale,
                    near: project.near,
                    far: project.far
                };
                break;

            case "frustum":
                this._camera.projection = {
                    projection: "frustum",
                    left: project.left,
                    right: project.right,
                    top: project.top,
                    bottom: project.bottom,
                    near: project.near,
                    far: project.far
                };
                break;

            case "custom":
                this._camera.projection = {
                    projection: "custom",
                    matrix: project.matrix.slice()
                };
                break;
        }

        this._numObjects = 0;

        const objects = scene.objects;

        for (var objectId in objects) {
            if (objects.hasOwnProperty(objectId)) {

                const object = objects[objectId];
                const i = this._numObjects;

                var objectInfo = this._objects[i];

                if (!objectInfo) {
                    objectInfo = {
                        objectId: objectId,
                        depth: 0,
                        visible: false,
                        edges: false,
                        xrayed: false,
                        highlighted: false,
                        selected: false,
                        clippable: false,
                        pickable: false,
                        colorize: [1, 1, 1],
                        opacity: 1.0
                    };
                    this._objects[i] = objectInfo;
                }

                objectInfo.objectId = objectId;
                objectInfo.depth = SceneState._getObjectDepth(object);
                objectInfo.visible = object.visible;
                objectInfo.edges = object.edges;
                objectInfo.xrayed = object.xrayed;
                objectInfo.highlighted = object.highlighted;
                objectInfo.selected = object.selected;
                objectInfo.clippable = object.clippable;
                objectInfo.pickable = object.pickable;
                objectInfo.colorize[0] = object.colorize[0];
                objectInfo.colorize[1] = object.colorize[1];
                objectInfo.colorize[2] = object.colorize[2];
                objectInfo.opacity = object.opacity;

                this._numObjects++;
            }
        }

        this._objects.length = this._numObjects;

        this._objects.sort((a, b) => {
            return a.depth - b.depth;
        })
    }

    static _getObjectDepth(object) {
        var depth = 0;
        while (object.parent) {
            object = object.parent;
            depth++;
        }
        return depth;
    }

    /**
     * Restores a {@link Scene} to state previously captured with {@link SceneState#save}.
     * @param {Scene} scene The scene.
     */
    restore(scene) {

        const camera = scene.camera;

        camera.eye = this._camera.eye;
        camera.look = this._camera.look;
        camera.up = this._camera.up;

        const savedProjection = this._camera.projection;

        camera.projection = savedProjection.projection;

        const project = camera.project;

        switch (savedProjection.type) {

            case "perspective":
                camera.perspective.fov = savedProjection.fov;
                camera.perspective.fovAxis = savedProjection.fovAxis;
                camera.perspective.near = savedProjection.near;
                camera.perspective.far = savedProjection.far;
                break;

            case "ortho":
                camera.ortho.scale = savedProjection.scale;
                camera.ortho.near = savedProjection.near;
                camera.ortho.far = savedProjection.far;
                break;

            case "frustum":
                camera.frustum.left = savedProjection.left;
                camera.frustum.right = savedProjection.right;
                camera.frustum.top = savedProjection.top;
                camera.frustum.bottom = savedProjection.bottom;
                camera.frustum.near = savedProjection.near;
                camera.frustum.far = savedProjection.far;
                break;

            case "custom":
                camera.customProjection.matrix = savedProjection.matrix;
                break;
        }

        for (var i = 0, len = this._objects.length; i < len; i++) {
            const objectInfo = this._objects[i];
            const object = scene.objects[objectInfo.objectId];
            if (!object) {
                continue;
            }
            object.visible = objectInfo.visible;
            object.edges = objectInfo.edges;
            object.xrayed = objectInfo.xrayed;
            object.highlighted = objectInfo.highlighted;
            object.selected = objectInfo.selected;
            object.clippable = objectInfo.clippable;
            object.pickable = objectInfo.pickable;
            object.colorize = objectInfo.colorize;
            object.opacity = objectInfo.opacity;
        }
    }
}

export {SceneState};