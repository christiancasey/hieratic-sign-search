//   ,ggg,        gg                                                               
//  dP""Y8b       88                                          I8                   
//  Yb, `88       88                                          I8                   
//   `"  88       88   gg                                  88888888  gg            
//       88aaaaaaa88   ""                                     I8     ""            
//       88"""""""88   gg    ,ggg,    ,gggggg,    ,gggg,gg    I8     gg     ,gggg, 
//       88       88   88   i8" "8i   dP""""8I   dP"  "Y8I    I8     88    dP"  "Yb
//       88       88   88   I8, ,8I  ,8'    8I  i8'    ,8I   ,I8,    88   i8'      
//       88       Y8,_,88,_ `YbadP' ,dP     Y8,,d8,   ,d8b, ,d88b, _,88,_,d8,_    _
//       8,gg,    `Y88P""Y8888P"Y8888P      `Y8P"Y8888P"`Y888P""Y888P""Y8P""Y8888PP
//       i8""8i                                                                    
//       `8,,8'                                                                    
//        `88'     gg                                                              
//        dP"8,    ""                                                              
//       dP' `8a   gg     ,gggg,gg   ,ggg,,ggg,                                    
//      dP'   `Yb  88    dP"  "Y8I  ,8" "8P" "8,                                   
//  _ ,dP'     I8  88   i8'    ,8I  I8   8I   8I                                   
//  "888,,____,dP_,88,_,d8,   ,d8I ,dP   8I   Yb,                                  
//  a8P"Y88888P" 8P""Y8P"Y8888P"8888P'   8I   `Y8                                  
//        ,gg,                ,d8I'                                                
//       i8""8i             ,dP'8I                          ,dPYb,                 
//       `8,,8'            ,8"  8I                          IP'`Yb                 
//        `88'             I8   8I                          I8  8I                 
//        dP"8,            `8, ,8I                          I8  8'                 
//       dP' `8a   ,ggg,    `,gggg,gg   ,gggggg,    ,gggg,  I8 dPgg,               
//      dP'   `Yb i8" "8i   dP"  "Y8I   dP""""8I   dP"  "Yb I8dP" "8I              
//  _ ,dP'     I8 I8, ,8I  i8'    ,8I  ,8'    8I  i8'       I8P    I8              
//  "888,,____,dP `YbadP' ,d8,   ,d8b,,dP     Y8,,d8,_    _,d8     I8,             
//  a8P"Y88888P" 888P"Y888P"Y8888P"`Y88P      `Y8P""Y8888PP88P     `Y8  

let canvas = document.getElementById("signPad");
let ctx = canvas.getContext("2d");
ctx.fillStyle = "#FFFFFF";
// ctx.fillRect(0,0,canvas.width, canvas.height);
ctx.strokeStyle = "#FF0000";
ctx.lineWidth = 8;
// ctx.strokeRect(20, 20, 150, 100);

const rect = canvas.getBoundingClientRect();
let image = ctx.getImageData(0, 0, canvas.width, canvas.height);

const getCursorPosition = (canvas, event) => {
  let x, y;
  // For touch events
  if (event.touches) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }
  return {x: x, y: y};
};

let mouseDown = false;

const down = e => {
  mouseDown = true;
  ctx.beginPath();
  e.preventDefault();
};

const up = e => {
  mouseDown = false;
  runSearch();
};

const move = e => {
  let coords = getCursorPosition(canvas, e);
  let rect = canvas.getBoundingClientRect();
  
  if (mouseDown) {
    ctx.lineTo(coords.x, coords.y);
    // ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    
    image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  
  e.preventDefault();
};

canvas.addEventListener('mousedown', down);
canvas.addEventListener('touchstart', down);
canvas.addEventListener('mousemove', move);
canvas.addEventListener('touchmove', move);
canvas.addEventListener('mouseup', up);
canvas.addEventListener('touchend', up);


const clearPad = e => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = "#FFFFFF";
  // ctx.fillRect(0,0,canvas.width, canvas.height);
  runSearch();
}

const display = (image, canvasName) => {
  // Display both integer matrices and imageData
  if (!image.data) {
    image = matrix2ImageData(int2RGB(image));
  }
  
  let dispCanvas = document.getElementById(canvasName);
  if (!dispCanvas)
    throw 'Invalid canvas id: ' + canvasName;
  
  let dispCtx = dispCanvas.getContext("2d");
  dispCtx.putImageData(image, 0, 0);
};

const displayPolygon = polygon => {
  let canvas = document.getElementById("pixel-polygon");
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  polygon.map(coords => {
    ctx.lineTo(coords[1], coords[0]);
    ctx.stroke();
  });
};

const findTopLeft = matrix => {
  let sourceIndices = getNonZeroIndices(matrix);
  
  if (!sourceIndices.length)
    return [0, 0];
  
  let distances = sourceIndices.map(index => index[0] ** 2 + index[1] ** 2);
  let minDist = distances.flat().sort((a,b) => a - b)[0];
  // let minDist = Math.min(...distances);
  let iMinDist = distances.indexOf(minDist);
  return sourceIndices[iMinDist].slice();
};

// DEPRECATED 08-07-2022 – CDC
const countUnvisited = matrix => {
  return matrix.flat().reduce((sum, a) => sum + a, 0);
}

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
    displayTracing[current[0]][current[1]] = i;
    
    orientation = getMoveFromDir(dir, matrix[current[0]][current[1]]);
    current[0] += orientation.move[0];
    current[1] += orientation.move[1];
    dir = orientation.dir;
    
    if (matrix[current[0]][current[1]]) {
      polygon.push(current.slice());
      displayTracing[current[0]][current[1]] = randint(10,20);
    } else {
      displayTracing[current[0]][current[1]] = 0;
    }
    
    if (current[0] === start[0] && current[1] === start[1])
      break;
  }
  
  console.log('len of polygon ' + polygon.length);
  display(displayTracing, 'trace');
  
  console.log(JSON.stringify(polygon));
  return polygon;
};


////////////////////////////////////////////////////////////////////////////////
// THIS IS THE PLACE WHERE THE STUFF ACTUALLY HAPPENS RIGHT NOW               //
////////////////////////////////////////////////////////////////////////////////
const runSearch = () => {
  // let imageEdge = new MarvinImage(image.data);
  
  // let imageEdge = new MarvinImage();
  // imageEdge.load(canvas.toDataURL(),  () => {
  //   let imageOut = new MarvinImage(imageEdge.getWidth(), imageEdge.getHeight());
  //   imageOut.clear(0xFF000000);
  //   Marvin.prewitt(imageEdge, imageOut);
  //   Marvin.blackAndWhite(imageOut, imageOut, 100);
  //   imageOut.draw(document.getElementById("filtered"));
  // });
  
  let image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  display(image, 'signPad');
  
  let matrix = imageData2Matrix(image);
  matrix = binarize(matrix);
  
  // Add a bit of padding to the original so that strokes that hit the frame 
  // still get proper edges around them in the final polygon
  matrix = padMatrix(matrix, [4, 4], 0);
  display(matrix, 'matrix');
  
  labeled = label(matrix);
  display(labeled, 'labeled');
  
  connected = connectRegions(edge(labeled));
  connected = union(connected, labeled);
  display(connected, 'connected');
  
  // Invert the connected regions and then label the background
  // Select the background as a region, thus making the edge follow only the outside shape
  inverted = label(invert(connected));
  inverted = getRegionByLabel(inverted, 1);
  display(inverted, 'inverted-labeled');
  
  solid = invert(inverted);
  display(solid, 'solid');
  
  edges = edge((inverted), 8);
  display(edges, 'edges');
  
  let traced = copyMatrix(edges);
  
  let topLeft = findTopLeft(traced);
  traced[topLeft[0]][topLeft[1]] = 2;
  getNeighbors(matrix, topLeft[0], topLeft[1], connectivity = 8)
    .map(neighbor => traced[neighbor[0]][neighbor[1]] = 2);
  display(traced, 'topleft');
  
  let polygon = traceShapePolygon(solid);
  
  displayPolygon(polygon);
  
  
  interpolatedPolygon = interpolate(polygon);
  
  
};





