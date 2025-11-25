
declare const AFRAME: any;
declare const THREE: any;

/**
 * Joystick Controls
 * Reads window.JOYSTICK_VECTOR (x, y) set by the React Joystick component.
 * Moves the Rig relative to the Camera's facing direction.
 */
AFRAME.registerComponent('joystick-controls', {
  schema: {
    speed: { type: 'number', default: 0.15 }
  },

  init: function () {
    this.camera = document.querySelector('[camera]');
    // Ensure the global vector exists
    if (!window.JOYSTICK_VECTOR) {
      window.JOYSTICK_VECTOR = { x: 0, y: 0 };
    }
  },

  tick: function () {
    if (!this.camera) return;

    const joy = window.JOYSTICK_VECTOR;
    
    // Deadzone check
    if (Math.abs(joy.x) < 0.1 && Math.abs(joy.y) < 0.1) return;

    // 1. Get Camera Direction
    const direction = new THREE.Vector3();
    this.camera.object3D.getWorldDirection(direction);
    
    // IMPORTANT: Three.js cameras look down the NEGATIVE Z-axis.
    // getWorldDirection returns the POSITIVE Z-axis (Backward).
    // We must NEGATE it to get the "Forward" direction.
    direction.negate(); 

    direction.y = 0; // Flatten on ground to prevent flying into the sky
    direction.normalize();

    // 2. Get Right Vector (Cross Product)
    // Forward x Up = Right
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3();
    right.crossVectors(direction, up).normalize(); 

    // 3. Calculate Move Vector
    // Forward movement: direction * joy.y
    // Strafe movement: right * joy.x
    
    const moveZ = direction.multiplyScalar(joy.y * this.data.speed);
    const moveX = right.multiplyScalar(joy.x * this.data.speed);

    // 4. Apply to Rig
    const currentPos = this.el.object3D.position;
    currentPos.add(moveZ);
    currentPos.add(moveX);
  }
});

export default null;
