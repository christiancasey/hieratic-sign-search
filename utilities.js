// A collection of useful generic tools

const copyMatrix = (matrix, fillValue = null) => {
  let newMatrix = JSON.parse(JSON.stringify(matrix));
  if (fillValue !== null) {
    newMatrix = newMatrix.map(row => row.map(pixel => fillValue));
  }
  return newMatrix;
};

// Returns an Array of SRGB values of length n+1 for the Iris colormap
const iris = (n, hex=false) => {
  let colormap = new Array();
  let purple = 2 * Math.PI / 3; // Offset to exclude magenta
  let thetaMax = 2 * Math.PI - purple; // Max length of curve in colorspace
  let angleStep = 2 * Math.PI / 3; // Shift in each cos fn for color channels
  
  for (let i = 0; i <= n; i++) {
    theta = (n-i) * thetaMax / n;
    let color = new Array();
    for (let j = 0; j < 3; j++)
      color.push( Math.floor(255 * (Math.cos(theta-angleStep*j)+1)/2 ) );
    color.push(255);
    
    if (hex) {
      color = color.reduce((s,i) => s + Math.round(i).toString(16).toUpperCase(), "#");
    }
    colormap.push(color);
  }
  
  return colormap;
};

const randint = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};