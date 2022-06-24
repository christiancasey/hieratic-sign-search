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
ctx.lineWidth = 10;
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
  console.log('Run search');
  runSearch();
};

const move = e => {
  let coords = getCursorPosition(canvas, e);
  
  if (mouseDown) {
    ctx.lineTo(coords.x, coords.y);
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

const copyImage = image => {
  const newImage = new ImageData(
    new Uint8ClampedArray(image.data),
    image.width,
    image.height
  );
  return newImage;
};

const imageData2Matrix = imageData => {
  let matrix = new Array();
  for (let y = 0; y < imageData.height; y++) {
  // for (let y = 0; y < 1; y++) {
    let row = new Array();
    for (let x = 0; x < imageData.width; x++) {
      let index = (y*imageData.width+x)*4;
      let pixel = new Array();
      for (let z = 0; z < 4; z++)
        pixel.push(imageData.data[index+z]);
      row.push(pixel);
    }
    matrix.push(row);
  }
  return matrix;
};

const binarize = matrix => {
  return matrix.map(row => 
    row.map(pixel => (pixel[3] ? 1 : 0))
  );
};

// Returns an Array of SRGB values of length n+1 for the Iris colormap
const iris = n => {
  let colormap = new Array();
  let purple = 2 * Math.PI / 3; // Offset to exclude magenta
  let thetaMax = 2 * Math.PI - purple; // Max length of curve in colorspace
  let angleStep = 2 * Math.PI / 3; // Shift in each cos fn for color channels
  
  for (let i = 0; i <= n; i++) {
    theta = i * thetaMax / n;
    let color = new Array();
    for (let j = 0; j < 3; j++)
      color.push( Math.floor(256 * (Math.cos(theta-angleStep*j)+1)/2 ) );
    color.push(255);
    colormap.push(color);
  }
  
  return colormap;
};

// Takes a binarized matrix and expands to full RGB pixel values
// Uses the iris colormap to decide on values
const int2RGB = matrix => {
  let n = Math.max(...matrix.flat());
  colormap = iris(n);
  return matrix.map(row => 
    // row.map(pixel => (pixel ? [255, 255, 255, 255] : [0, 0, 0, 255]))
    row.map(pixel => colormap[pixel])
  );
};

const matrix2ImageData = matrix => {
  return new ImageData(
    new Uint8ClampedArray(matrix.flat(2)),
    image.width,
    image.height
  );
};

const invertImage = image => {
  let matrix = imageData2Matrix(image);
  matrix = matrix.map(row => 
    row.map(pixel => {
      for (let z = 0; z < 3; z++)
        pixel[z] = (255-pixel[z]);
      return pixel;
    })
  );
  return matrix2ImageData(matrix);
};

const randint = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

const getSize = matrix => {
  let n = matrix.length;
  if (!n)
    return [0, 0];
  let m = matrix[0].length;  
  return [n, m];
};

const getNeighbors = (matrix, y, x, connectivity = 4) => {
  if (connectivity != 4 && connectivity != 8)
    throw 'Invalid connectivity parameter. Must be 4 or 8. Given: ' + connectivity;
  [n, m] = getSize(matrix);

  let neighborIndices = new Array();
  
  // Doing it the dumb way to get it done
  // Probably should figure out a more elegant solution
  if (x-1 >= 0)
    neighborIndices.push([y, x-1]);
  if (x+1 < m)
    neighborIndices.push([y, x+1]);
  if (y-1 >= 0)
    neighborIndices.push([y-1, x]);
  if (y+1 < n)
    neighborIndices.push([y+1, x]);
  
  if (connectivity === 8) {
    if (x-1 >= 0 && y-1 >= 0)
      neighborIndices.push([y-1, x-1]);
    if (x+1 < m && y-1 >= 0)
      neighborIndices.push([y-1, x+1]);
    if (x-1 >= 0 && y+1 < n)
      neighborIndices.push([y+1, x-1]);
    if (x+1 < m && y+1 < n)
      neighborIndices.push([y+1, x+1]);
  }
  
  // let neighbors = neighborIndices.map(index => matrix[index[0]][index[1]]);
  // 
  // return neighbors;
  return neighborIndices;
}

// Returns a matrix with connected regions given integer labels
// Algorithm described here: https://en.wikipedia.org/wiki/Connected-component_labeling
const label = (matrix, connectivity = 4) => {
  if (connectivity != 4 && connectivity != 8)
    throw 'Invalid connectivity parameter. Must be 4 or 8. Given: ' + connectivity;
  [n, m] = getSize(matrix);
  
  let labeled = matrix.slice();
  labeled = labeled.map(row => row.map(pixel => 0));
  
  let queue = new Array();
  
  let current = 1;
  
  for (let y = 0; y < n; y++)
    for (let x = 0; x < m; x++)
      if (matrix[y][x] && !labeled[y][x]) {
        queue.unshift([y,x]);
        
        let kill = 0;
        while (queue.length && kill < 10000) {
          kill++;  // prevent infinite loop for debugging
          
          let index = queue.pop();
          
          labeled[index[0]][index[1]] = current;
          let neighbors = getNeighbors(labeled, index[0], index[1], connectivity);
          // Keep only neighbors that are not background
          // are not yet labeled
          // and are not already in the queue
          neighbors = neighbors.filter(neighbor => {
            if (matrix[neighbor[0]][neighbor[1]] 
              && !labeled[neighbor[0]][neighbor[1]]
              && !JSON.stringify(queue).includes(JSON.stringify(neighbor)))
                return neighbor;
          });
          if (neighbors.length)
            queue.unshift(...neighbors);
        
        
        }
        current++;
      }
  return labeled;
};




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
  let matrix = imageData2Matrix(image);
  matrix = binarize(matrix);
  labeled = label(matrix, 8);
  
  display(image, 'signPad');
  display(matrix,'matrix');
  display(labeled, 'labeled');
  
};





