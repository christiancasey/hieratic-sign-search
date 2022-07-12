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
ctx.lineWidth = 5;
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



////////////////////////////////////////////////////////////////////////////////
// THIS IS THE PLACE WHERE THE STUFF ACTUALLY HAPPENS RIGHT NOW               //
////////////////////////////////////////////////////////////////////////////////
const runSearch = () => {
  
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
  
  displayPolygon(polygon, 'pixel-polygon');
  
  
  interpolatedPolygon = interpolate(polygon);
  displayPolygon(interpolatedPolygon, 'interpolated-polygon');
  
  interpolatedPolygon = normalize(interpolatedPolygon);
  // displayPolygon(interpolatedPolygon, 'interpolated-polygon');
  
  document.getElementById('output').innerHTML = JSON.stringify(polygon);
  
};





