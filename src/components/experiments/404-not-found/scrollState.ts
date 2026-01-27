// Shared mutable state for scroll velocity
// Using a simple object ref avoids React Context overhead for high-frequency updates (60fps)
export const scrollVelocityRef = { current: 0 };
