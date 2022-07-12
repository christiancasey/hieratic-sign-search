// The number crunching stuff
// Polygon interpolation
// PCA
// etc.


const getMoveFromDir = (dir, turn) => {
  let move = [0, 0];
  
  turn = (turn ? 'l' : 'r'); // A black pixel means turn left, white, right
  let newDir = null;
  
  if (dir === 'e') {
    move[0] = (turn === 'l' ? -1 : 1);
    newDir = (turn === 'l' ? 'n' : 's');
  }
  if (dir === 'w') {
    move[0] = (turn === 'r' ? -1 : 1);
    newDir = (turn === 'r' ? 'n' : 's');
  }
  if (dir === 's') {
    move[1] = (turn === 'r' ? -1 : 1);
    newDir = (turn === 'r' ? 'w' : 'e');
  }
  if (dir === 'n') {
    move[1] = (turn === 'l' ? -1 : 1);
    newDir = (turn === 'l' ? 'w' : 'e');
  }
  
  let orientation = { move: move, dir: newDir };
  return orientation;
};

const traceShapePolygon = matrix => {
  
  // Extra matrix to show a nice color gradient of the tracing procedure
  let displayTracing = copyMatrix(matrix, 0);
  
  
  let start = findTopLeft(matrix);
  let current = start.slice();
  
  let polygon = [];
  polygon.push(current.slice());
  
  let dirs = [ 'e', 's', 'w', 'n' ];
  let dir = 'e';
  
  let orientation;
  
  for (let i = 0; i < 10000; i++) {
    
    orientation = getMoveFromDir(dir, matrix[current[0]][current[1]]);
    current[0] += orientation.move[0];
    current[1] += orientation.move[1];
    dir = orientation.dir;
    
    if (matrix[current[0]][current[1]]) {
      if (polygon.slice(-1).toString() !== current.toString()) {
        polygon.push(current.slice());
        displayTracing[current[0]][current[1]] = i+100;
        // displayTracing[Math.floor(current[0]+Math.random()*2-1)][Math.floor(current[1]+Math.random()*2-1)] = i+100;
      }
    } else {
      displayTracing[current[0]][current[1]] = 0;
    }
    
    if (current[0] === start[0] && current[1] === start[1])
      break;
  }
  
  display(displayTracing, 'trace');
  
  polygon.push(polygon[0].slice());
  return polygon;
};


// Takes a polygon and reduces the number of coordinates to a given value
interpolate = (polygon, n = 100) => {
  
  // polygon.push(polygon[0].slice());
  let magnitudes = getMagnitudes(polygon);
  let totalMagnitude = magnitudes.reduce((sum, a) => sum + a);
  let step = totalMagnitude / n;
  let currentStep = step;
  
  let interp = [];
  interp.push(polygon[0].slice());
  
  let maxSections = magnitudes.length;
  for (let i = 0; i < maxSections; i++) {
    let a = polygon[i].slice();
    let b = polygon[i+1].slice();
    if (currentStep > magnitudes[i]) {
      currentStep -= magnitudes[i];
    } else {
      let ratio = currentStep / magnitudes[i];
      let a = polygon[i].map(coord => coord*(1-ratio));
      let b = polygon[i+1].map(coord => coord*ratio);
      
      interp.push(addArrays(a,b));
      currentStep = step - (magnitudes[i] - currentStep);
    }
  }
  return interp;
};


getCentroid = polygon => {
  let centY = polygon.reduce((sum, a) => sum + a[0], 0) / polygon.length;
  let centX = polygon.reduce((sum, a) => sum + a[1], 0) / polygon.length;
  
  return [centY, centX];
};

getStdDev = polygon => {
  let centroid = getCentroid(polygon);
  let squares = polygon.map(coords => (coords[0]-centroid[0])**2 + (coords[1]-centroid[1])**2);
  squares = squares.reduce((sum, a) => sum + a, 0) / (squares.length-1);
  return squares ** 0.5;
};

normalize = polygon => {
  let centroid = getCentroid(polygon);
  let stddev = getStdDev(polygon);
  stddev /= 50;  // Boost the scale factor a bit so it's not so tiny
  polygon = polygon.map(coords => [coords[0]-centroid[0], coords[1]-centroid[1]]);
  polygon = polygon.map(coords => [coords[0]/stddev, coords[1]/stddev]);
  
  return polygon;
}

getMagnitudes = polygon => {
  magnitudes = [];
  
  for (let i = 0; i < polygon.length-1; i++) {
    let a = polygon[i];
    let b = polygon[i+1];
    magnitudes.push( ( (a[0]-b[0])**2 + (a[1]-b[1])**2 ) ** 0.5 );
  }
  
  return magnitudes;
};

// 
// displayPolygon(polygon, 'pixel-polygon');
// interp = interpolate(polygon);
// displayPolygon(polygon, 'interpolated-polygon');








