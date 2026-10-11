// letters.js

// Helper functions to generate smooth curve points
function bezierPoints(p1, cp1, cp2, p2, steps = 15) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = Math.pow(1-t, 3) * p1[0] + 3 * Math.pow(1-t, 2) * t * cp1[0] + 3 * (1-t) * Math.pow(t, 2) * cp2[0] + Math.pow(t, 3) * p2[0];
        const y = Math.pow(1-t, 3) * p1[1] + 3 * Math.pow(1-t, 2) * t * cp1[1] + 3 * (1-t) * Math.pow(t, 2) * cp2[1] + Math.pow(t, 3) * p2[1];
        pts.push([x, y]);
    }
    return pts;
}

function ellipsePoints(cx, cy, rx, ry, startAngle, endAngle, steps = 25) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / steps);
        pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
    }
    return pts;
}

// Letter definitions using point arrays (0,0 is top-left, w,h is bottom-right)
const letterDefinitions = {
    A: (w, h) => [ [[0, h], [w/2, 0]], [[w/2, 0], [w, h]], [[w*0.2, h*0.5], [w*0.8, h*0.5]] ],
    B: (w, h) => [ 
        [[0, h], [0, 0]], 
        bezierPoints([0,0], [w, 0], [w, h*0.5], [0, h*0.5]),
        bezierPoints([0, h*0.5], [w, h*0.5], [w, h], [0, h])
    ],
    C: (w, h) => [ ellipsePoints(w/2, h/2, w/2, h/2, Math.PI*0.25, Math.PI*1.75, 20) ],
    D: (w, h) => [ 
        [[0, h], [0, 0]], 
        bezierPoints([0,0], [w, 0], [w, h], [0, h]) 
    ],
    E: (w, h) => [ [[0, h], [0, 0]], [[0, 0], [w, 0]], [[0, h*0.5], [w*0.7, h*0.5]], [[0, h], [w, h]] ],
    F: (w, h) => [ [[0, h], [0, 0]], [[0, 0], [w, 0]], [[0, h*0.5], [w*0.7, h*0.5]] ],
    G: (w, h) => [ 
        ellipsePoints(w/2, h/2, w/2, h/2, Math.PI*0.25, Math.PI*1.75, 20),
        [[w, h/2], [w*0.5, h/2]] 
    ],
    H: (w, h) => [ [[0, 0], [0, h]], [[w, 0], [w, h]], [[0, h/2], [w, h/2]] ],
    I: (w, h) => [ [[w/2, 0], [w/2, h]] ],
    J: (w, h) => [ 
        [[w/2, 0], [w/2, h*0.7]],
        bezierPoints([w/2, h*0.7], [w/2, h], [0, h], [0, h*0.7], 15)
    ],
    K: (w, h) => [ [[0, 0], [0, h]], [[0, h*0.5], [w, 0]], [[0, h*0.5], [w, h]] ],
    L: (w, h) => [ [[0, 0], [0, h]], [[0, h], [w, h]] ],
    M: (w, h) => [ [[0, h], [0, 0]], [[0, 0], [w/2, h*0.5]], [[w/2, h*0.5], [w, 0]], [[w, 0], [w, h]] ],
    N: (w, h) => [ [[0, h], [0, 0]], [[0, 0], [w, h]], [[w, h], [w, 0]] ],
    O: (w, h) => [ ellipsePoints(w/2, h/2, w/2, h/2, 0, Math.PI*2, 25) ],
    P: (w, h) => [ 
        [[0, h], [0, 0]], 
        bezierPoints([0,0], [w, 0], [w, h*0.5], [0, h*0.5]) 
    ],
    Q: (w, h) => [ 
        ellipsePoints(w/2, h/2, w/2, h/2, 0, Math.PI*2, 25),
        [[w*0.5, h*0.5], [w, h]] 
    ],
    R: (w, h) => [ 
        [[0, h], [0, 0]], 
        bezierPoints([0,0], [w, 0], [w, h*0.5], [0, h*0.5]),
        [[0, h*0.5], [w, h]] 
    ],
    // ★ Sharper, proportional S — tighter footprint, angular curves,
    //   endpoints aligned with the visual style of C, G, O
    S: (w, h) => [
        bezierPoints(
            [w * 0.88, h * 0.18],
            [w * 0.55, h * 0.00],
            [w * 0.12, h * 0.22],
            [w * 0.12, h * 0.42],
            20
        ),
        bezierPoints(
            [w * 0.12, h * 0.42],
            [w * 0.12, h * 0.58],
            [w * 0.88, h * 0.42],
            [w * 0.88, h * 0.58],
            20
        ),
        bezierPoints(
            [w * 0.88, h * 0.58],
            [w * 0.88, h * 0.78],
            [w * 0.45, h],
            [w * 0.12, h * 0.82],
            20
        )
    ],
    T: (w, h) => [ [[0, 0], [w, 0]], [[w/2, 0], [w/2, h]] ],
    U: (w, h) => [ 
        [[0, 0], [0, h*0.7]], 
        bezierPoints([0, h*0.7], [0, h], [w, h], [w, h*0.7]),
        [[w, h*0.7], [w, 0]] 
    ],
    V: (w, h) => [ [[0, 0], [w/2, h]], [[w/2, h], [w, 0]] ],
    W: (w, h) => [ [[0, 0], [w*0.25, h]], [[w*0.25, h], [w/2, h*0.5]], [[w/2, h*0.5], [w*0.75, h]], [[w*0.75, h], [w, 0]] ],
    X: (w, h) => [ [[0, 0], [w, h]], [[0, h], [w, 0]] ],
    Y: (w, h) => [ [[0, 0], [w/2, h*0.5]], [[w, 0], [w/2, h*0.5]], [[w/2, h*0.5], [w/2, h]] ],
    Z: (w, h) => [ [[0, 0], [w, 0]], [[w, 0], [0, h]], [[0, h], [w, h]] ]
};