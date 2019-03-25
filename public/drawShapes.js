const bcr = 6;

function tmp() {
  var tmp = d3.path();
  tmp.moveTo(0,0);
  tmp.lineTo(0, -bcr);
  tmp.moveTo(0,0);
  tmp.lineTo(-bcr, 0);
  return tmp.toString();
}

function dot() {
  var path =
    "m " + -0.5 + ", 0" +
    "a " + 0.5 + "," + 0.5 + " 0 1, 0 " + (0.5*2) + ", 0" +
    "a " + 0.5 + "," + 0.5 + " 0 1, 0 " + -(0.5*2) + ", 0";
  return path;
}

function circle() {
  var path =
    "m " + -bcr + ", 0" +
    "a " + bcr + "," + bcr + " 0 1, 0 " + (bcr*2) + ", 0" +
    "a " + bcr + "," + bcr + " 0 1, 0 " + -(bcr*2) + ", 0";
  return path;
}

function pentagon() {
  var p = d3.path();
  p.moveTo(bcr * Math.cos(degToRad(-18)), bcr * Math.sin(degToRad(-18)));
  p.lineTo(0, -bcr);
  p.lineTo(bcr * Math.cos(degToRad(-162)), bcr * Math.sin(degToRad(-162)));
  p.lineTo(bcr * Math.cos(degToRad(-234)), bcr * Math.sin(degToRad(-234)));
  p.lineTo(bcr * Math.cos(degToRad(-306)), bcr * Math.sin(degToRad(-306)));
  p.lineTo(bcr * Math.cos(degToRad(-18)), bcr * Math.sin(degToRad(-18)));
  p.lineTo(0, -bcr);
  return p.toString();
}

function square() {
  var s = d3.path();
  s.moveTo(bcr * Math.cos(degToRad(45)), bcr * Math.sin(degToRad(45)));
  s.lineTo(bcr * Math.cos(degToRad(135)), bcr * Math.sin(degToRad(135)));
  s.lineTo(bcr * Math.cos(degToRad(-135)), bcr * Math.sin(degToRad(-135)));
  s.lineTo(bcr * Math.cos(degToRad(-45)), bcr * Math.sin(degToRad(-45)));
  s.lineTo(bcr * Math.cos(degToRad(45)), bcr * Math.sin(degToRad(45)));
  return s.toString();
}

function triangle() {
  var t = d3.path();
  t.moveTo(0,-bcr);
  t.lineTo(bcr * Math.cos(degToRad(30)), bcr * Math.sin(degToRad(30)));
  t.lineTo(bcr * Math.cos(degToRad(150)), bcr * Math.sin(degToRad(150)));
  t.lineTo(0,-bcr);
  t.lineTo(bcr * Math.cos(degToRad(30)), bcr * Math.sin(degToRad(30)));
  return t.toString();
}

function sixLine() {
  var path = d3.path();
    path.moveTo(0, -bcr);
    path.lineTo(0, bcr);
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(-30)), bcr * Math.sin(degToRad(-30)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(30)), bcr * Math.sin(degToRad(30)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(150)), bcr * Math.sin(degToRad(150)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(-150)), bcr * Math.sin(degToRad(-150)));
    path.closePath();
  return path;
}

function fiveLine() {
  var path = d3.path();
    path.moveTo(0, 0);
    path.lineTo(0, -bcr);
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(-18)), bcr * Math.sin(degToRad(-18)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(54)), bcr * Math.sin(degToRad(54)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(-234)), bcr * Math.sin(degToRad(-234)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(-162)), bcr * Math.sin(degToRad(-162)));
  return path;
}

function fourLine() {
  var path = d3.path();
    path.moveTo(0, 0);
    path.lineTo(bcr, 0);
    path.moveTo(0, 0);
    path.lineTo(-bcr, 0);
    path.moveTo(0, 0);
    path.lineTo(0, -bcr);
    path.moveTo(0, 0);
    path.lineTo(0, bcr);
    path.closePath();
  return path;
}

function threeLine() {
  var path = d3.path();
    path.moveTo(0, 0);
    path.lineTo(0, -bcr);
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(30)), bcr * Math.sin(degToRad(30)));
    path.moveTo(0, 0);
    path.lineTo(bcr * Math.cos(degToRad(150)), bcr * Math.sin(degToRad(150)));
    path.closePath();
  return path;
}

let allShapes = [sixLine, fiveLine, fourLine, threeLine, circle, square, pentagon, triangle];
function pickTwo() {

  let i = Math.floor(Math.random()*allShapes.length);
  let j = Math.floor(Math.random()*allShapes.length);

  if(i == j) return pickTwo();

  return [allShapes[i], allShapes[j]];
}
