// Image processing functions with wide range of usage


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

const displayPolygon = (polygon, canvasName, colors=true) => {
  let canvas = document.getElementById(canvasName);
  let ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0,0,canvas.width, canvas.height);

  
  colormap = iris(polygon.length, true);
  if (false) {
    for (let i = 0; i < polygon.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = colormap[i];
      ctx.arc(polygon[i][1], polygon[i][0], 1, 1, Math.PI * 1, true);
      ctx.fill();
      ctx.closePath();
    }
  } else {
    
    for (let i = 0; i < polygon.length; i++) {
      ctx.beginPath();
      ctx.strokeStyle = colormap[i];
      ctx.lineWidth = 1;
      ctx.moveTo(polygon[i][1], polygon[i][0]);
      ctx.lineTo(polygon[(i+1) % polygon.length][1], polygon[(i+1) % polygon.length][0]);
      ctx.stroke();
    }
    // ctx.strokeStyle = "#000000";
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // polygon.map((coords,i) => {
    //   ctx.lineTo(coords[1], coords[0]);
    //   ctx.stroke();
    // });
  }
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


// Takes a binarized matrix and expands to full RGB pixel values
// Uses the iris colormap to decide on values
const int2RGB = matrix => {
  let n = Math.max(...matrix.flat());
  // let n = Math.max(...matrix.map(row => Math.max(...row)));
  // let n = matrix.flat().sort().slice(-1);
  
  colormap = iris(n);
  return matrix.map(row => 
    // row.map(pixel => (pixel ? [255, 255, 255, 255] : [0, 0, 0, 255]))
    row.map(pixel => colormap[pixel])
  );
};

const matrix2ImageData = matrix => {
  [n, m] = getSize(matrix);
  return new ImageData(
    new Uint8ClampedArray(matrix.flat(2)),
    m,
    n
  );
};


// DEPRECATE — Doesn't seem to be needed for anything anymore
// Better to invert the matrix rather than the image object
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


const binarize = matrix => {
  if (matrix.flat().some(pixel => pixel.length > 3 && pixel[3] === 0)) {
    return matrix.map(row => 
      row.map(pixel => (pixel[3] ? 1 : 0))
    );
  } else {
    return matrix.map(row => 
      row.map(pixel => (pixel.some(p => (p>0 ? 1 : 0)))
    ));
  }
  
};


const getSize = matrix => {
  let n = matrix.length;
  if (!n)
    return [0, 0];
  let m = matrix[0].length;  
  return [n, m];
};

const padMatrix = (matrix, padSize = [1, 1], fillValue = 0) => {
  // padSize[0] = y padding, padSize[1] = x padding
  [n, m] = getSize(matrix);
  
  // Add the horizontal padding
  matrix = matrix.map(row => {
    for (let i = 0; i < padSize[1]; i++) {
      row.unshift(fillValue);
      row.push(fillValue);
    }
    return row;
  });
  
  // Add the vertical padding
  let top = new Array(m+2*padSize[1]).fill(fillValue);
  for (let i = 0; i < padSize[0]; i++) {
    matrix.unshift(top.slice());
    matrix.push(top.slice());
  }
  
  return matrix;
};

const getNeighbors = (matrix, y, x, connectivity = 4) => {
  if (connectivity != 4 && connectivity != 8)
    throw 'Invalid connectivity parameter. Must be 4 or 8. Given: ' + connectivity;
  [n, m] = getSize(matrix);

  let neighborIndices = new Array();
  
  // Doing it the dumb way to get it done
  // Probably should figure out a more elegant solution
  // Needs to start at 12:00 and go round turnwise for polygon edge finding
  
  // 12
  if (y-1 >= 0)
    neighborIndices.push([y-1, x]);
  // 3
  if (x+1 < m)
    neighborIndices.push([y, x+1]);
  // 6
  if (y+1 < n)
    neighborIndices.push([y+1, x]);
  // 9
  if (x-1 >= 0)
    neighborIndices.push([y, x-1]);
  // 1.5
  if (connectivity === 8 && x+1 < m && y-1 >= 0)
    neighborIndices.push([y-1, x+1]);
  // 4.5
  if (connectivity === 8 && x+1 < m && y+1 < n)
    neighborIndices.push([y+1, x+1]);
  // 7.5
  if (connectivity === 8 && x-1 >= 0 && y+1 < n)
    neighborIndices.push([y+1, x-1]);
  //10.5
  if (connectivity === 8 && x-1 >= 0 && y-1 >= 0)
    neighborIndices.push([y-1, x-1]);
  // // 12
  // if (y-1 >= 0)
  //   neighborIndices.push([y-1, x]);
  // // 1.5
  // if (connectivity === 8 && x+1 < m && y-1 >= 0)
  //   neighborIndices.push([y-1, x+1]);
  // // 3
  // if (x+1 < m)
  //   neighborIndices.push([y, x+1]);
  // // 4.5
  // if (connectivity === 8 && x+1 < m && y+1 < n)
  //   neighborIndices.push([y+1, x+1]);
  // // 6
  // if (y+1 < n)
  //   neighborIndices.push([y+1, x]);
  // // 7.5
  // if (connectivity === 8 && x-1 >= 0 && y+1 < n)
  //   neighborIndices.push([y+1, x-1]);
  // // 9
  // if (x-1 >= 0)
  //   neighborIndices.push([y, x-1]);
  // //10.5
  // if (connectivity === 8 && x-1 >= 0 && y-1 >= 0)
  //   neighborIndices.push([y-1, x-1]);
  
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
        
        while (queue.length) {
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

const edge = (matrix, connectivity = 4) => {
  if (connectivity != 4 && connectivity != 8)
    throw 'Invalid connectivity parameter. Must be 4 or 8. Given: ' + connectivity;
  [n, m] = getSize(matrix);
  
  let edges = matrix.slice();
  edges = edges.map(row => row.map(pixel => 0));
  
  for (let y = 0; y < n; y++)
    for (let x = 0; x < m; x++)
      if (matrix[y][x]) {
        let neighbors = getNeighbors(labeled, y, x, connectivity);
        isEdge = neighbors.some(neighbor => !matrix[neighbor[0]][neighbor[1]]);
        edges[y][x] = (isEdge ? matrix[y][x] : 0);
      }
  return edges;
};

const getRegionByLabel = (labeled, label, complement = false) => {
  let region = labeled.slice();
  if (complement) {
    region = labeled.map(row => row.map(pixel => ((pixel !== label && pixel > 0) ? 1 : 0)));
  } else {
    region = labeled.map(row => row.map(pixel => (pixel === label ? 1 : 0)));
  }
  return region;
};

const getNonZeroIndices = matrix => {
  [n, m] = getSize(matrix);
  
  let indices = new Array();
  for (let y = 0; y < n; y++)
    for (let x = 0; x < m; x++)
      if (matrix[y][x] > 0)
        indices.push([y, x]);
  return indices;
};

const connectRegions = (labeled, depth=0, n0=null) => {
  
  let connected = labeled.slice();
  connected = connected.map(row => row.map( pixel => (pixel > 0 ? 1 : 0)));
  
  let n = Math.max(...labeled.flat());
  
  if (n < 2)
    return connected;
  
  // prevent infinite recursion
  if (!n0)
    n0 = n;
  if (depth > n0)
    return connected;
  
  let source = labeled.slice();
  let others = labeled.slice();
  
  for (let current = 1; current < 2; current++) {
    source = getRegionByLabel(labeled, current, false);
    others = getRegionByLabel(labeled, current, true);
    
    let sourceIndices = getNonZeroIndices(source);
    let othersIndices = getNonZeroIndices(others);
    let sourceLen = sourceIndices.length;
    let othersLen = othersIndices.length;
    
    let dist = new Array();
    for (let i = 0; i < sourceLen; i++) {
      dist[i] = new Array();
      for (let j = 0; j < othersIndices.length; j++) {
        dist[i][j] = (sourceIndices[i][0] - othersIndices[j][0]) ** 2
          + (sourceIndices[i][1] - othersIndices[j][1]) ** 2;
      }
    }
    
    let minDist = dist.flat().sort((a,b) => a - b)[0];
    let minIndex = dist.flat().indexOf(minDist);
    minI = Math.floor( minIndex / othersLen );
    minJ = minIndex % othersLen;
    
    // connected[sourceIndices[minI][0]][sourceIndices[minI][1]] = 2;
    // connected[othersIndices[minJ][0]][othersIndices[minJ][1]] = 2;
    let destLabel = labeled[othersIndices[minJ][0]][othersIndices[minJ][1]];
    
    let xLength = othersIndices[minJ][1] - sourceIndices[minI][1];
    let yLength = othersIndices[minJ][0] - sourceIndices[minI][0];
    
    let nSteps = Math.max(Math.abs(xLength), Math.abs(yLength));
    for (let t = 0; t <= nSteps; t+=0.25) {
      x = Math.round(t*xLength/nSteps);
      y = Math.round(t*yLength/nSteps);
      
      for (let jigger = -1; jigger <= 1; jigger++) {
        connected[sourceIndices[minI][0]+y+jigger][sourceIndices[minI][1]+x] = 1;
        connected[sourceIndices[minI][0]+y][sourceIndices[minI][1]+x+jigger] = 1;
      }
    }
  }
  
  connected = label(connected, 8);
  // return connected;
  return connectRegions(connected, depth+1, n0);
};

const union = (matrix1, matrix2) => {
  [n1, m1] = getSize(matrix1);
  [n2, m2] = getSize(matrix2);
  
  // Only perform union of identically sized matrices (for now)
  if (n1 !== n2 || m1 !== m2)
    return null;
  
  for (let y = 0; y < n1; y++)
    for (let x = 0; x < m1; x++)
      matrix1[y][x] = (matrix1[y][x] > 0 || matrix2[y][x] > 0) ? 1 : 0;
  
  return matrix1;
};

const invert = matrix => {
  return matrix.map(row => 
    row.map(pixel => pixel ? 0 : 1)
  );
};