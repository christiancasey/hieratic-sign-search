

// const display = (image, canvasName) => {
//   // Display both integer matrices and imageData
//   if (!image.data) {
//     image = matrix2ImageData(int2RGB(image));
//   }
// 
//   let dispCanvas = document.getElementById(canvasName);
//   if (!dispCanvas)
//     throw 'Invalid canvas id: ' + canvasName;
// 
//   let dispCtx = dispCanvas.getContext("2d");
//   dispCtx.putImageData(image, 0, 0);
// };


let canvas = document.getElementById("current");
let ctx = canvas.getContext("2d");
// ctx.fillStyle = "#FFFFFF";

base_image = new Image();
base_image.src = './hieratic_images/0000_5534.png';
// base_image.src = URL.createObjectURL('./hieratic_images/0000_5534.tif');
base_image.src = './cat.jpg';
base_image.onload = () => ctx.drawImage(base_image, 0, 0);
// ctx.drawImage(base_image, 0, 0);
// 
let image = ctx.getImageData(0, 0, canvas.width, canvas.height);
// console.log(image);
// 
let matrix = imageData2Matrix(image);
console.log(matrix.flat().some(x => x));

console.log(matrix);
matrix = binarize(matrix);

// matrix = matrix.map(row => 
//   row.map(pixel => pixel.some(p => (p ? 1 : 0))));
matrix = invert(matrix);
console.log(matrix.flat().some(x => x));
console.log(matrix);
// 
// 
// // Add a bit of padding to the original so that strokes that hit the frame 
// // still get proper edges around them in the final polygon
// // matrix = padMatrix(matrix, [4, 4], 0);
matrix = int2RGB(matrix);
image = matrix2ImageData(matrix);
display(image, 'output-image');

