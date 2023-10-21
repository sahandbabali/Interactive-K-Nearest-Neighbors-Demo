let clusters = [];
let n = 3; // Number of clusters
let m = 5; // Number of members in each cluster
let scatterFactor = 70; // Adjust this value for more or less scattering
let k = 3
let grid = []; // The grid matrix

let rows = 75; // Number of rows in the grid
let cols = 100; // Number of columns in the grid
let cellWidth, cellHeight; // Width and height of each cell

let showgrid = true

let showaxes = false

let randomdata = document.getElementById("randomdata")
randomdata.addEventListener("click", e => {
    generateClusteredData(n, m);

})

let classesrange = document.getElementById("classesrange")
let numclassesui = document.getElementById("numclassesui")
classesrange.addEventListener("input", e => {
    // console.log(e.target.value)

    // update number of clusters (n)
    n = e.target.value
    //update ui
    numclassesui.textContent = e.target.value;

    // regenerate data
    generateClusteredData(n, m);

})

let clustersizerange = document.getElementById("clustersizerange")
let clustersizeui = document.getElementById("clustersizeui")
clustersizerange.addEventListener("input", e => {
    // console.log(e.target.value)

    // update cluster size (m)
    m = e.target.value
    //update ui
    clustersizeui.textContent = e.target.value;

    // regenerate data
    generateClusteredData(n, m);

})



let kvalue = document.getElementById("kvalue")
let kvalueui = document.getElementById("kvalueui")
kvalue.addEventListener("input", e => {
    // console.log(e.target.value)

    // update cluster size (m)
    k = e.target.value
    //update ui
    kvalueui.textContent = e.target.value;

    // regenerate data
    generateClusteredData(n, m);

})




let showgridinp = document.getElementById("showgridinp")
showgridinp.addEventListener("change", e => {
    showgrid = showgridinp.checked;
})


let showaxis = document.getElementById("showaxis")
showaxis.addEventListener("change", e => {
    showaxes = showaxis.checked;
})


document.getElementById("screenshot").addEventListener("click", e => {
    saveCanvas('screenshot', 'png');

})



let clusterColors = [
    "#E63946", // Red
    "#F4A261", // Orange
    "#2A9D8F", // Teal
    "#F1FAEE", // White
    "#1D3557", // Dark Blue
    "#E9C46A", // Yellow
    "#7209B7",  // Purple
    "#A8DADC", // Blue
    "#FDCB6E", // Light Orange

    "#457B9D", // Navy

];

function setup() {
    //   frameRate(30)

    pixelDensity(1); // Set pixel density to 1 for consistent rendering
    noSmooth(); // Disable smoothing for the canvas


    const canvasBox = select('#canvasbox');
    const canvasWidth = canvasBox.width;
    const canvasHeight = canvasWidth * 78 / 100;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvasbox');

    // Calculate the cell dimensions
    cellWidth = width / cols;
    cellHeight = height / rows;


    // Initialize the grid matrix
    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            grid[i][j] = "#FFFFFF"; // You can set values for each cell as needed
        }
    }


    generateClusteredData(n, m);

}

function draw() {

    background(220);


    if (showgrid) {
        drawboundaries()

    }

    if (showaxes) {
        drawaxis()

    }





    // draw data points
    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
        let cluster = clusters[clusterIndex];
        //  let color = clusterColors[clusterIndex]
        for (let pointIndex = 0; pointIndex < cluster.length; pointIndex++) {
            let point = cluster[pointIndex];
            // noFill();
            strokeWeight(1)

            fill(clusterColors[point.clusterid])
            stroke(0);
            ellipse(point.x, point.y, 20, 20);
        }
    }



    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {


        // calculate clossest points
        let closestPoints = getClosestPoints(clusters, k, mouseX, mouseY);
        //   console.log(closestPoints)

        // Draw lines between the mouse and the closest points
        for (let point of closestPoints) {
            strokeWeight(3)
            stroke(clusterColors[point.clusterid]);
            line(mouseX, mouseY, point.x, point.y);
        }

        // Draw a circle at the current mouse position
        let circleSize = 20; // Adjust the circle size as needed

        // calculate knn for mouse position

        let tempclusteridarray = []

        for (let index = 0; index < closestPoints.length; index++) {

            tempclusteridarray.push(closestPoints[index].clusterid)
        }

        let mostrepeated = findMostRepeatedValue(tempclusteridarray)




        fill(lightenHexColor(clusterColors[mostrepeated], 70)); // Set the circle fill color
        stroke("black")

        ellipse(mouseX, mouseY, circleSize, circleSize);

    }






}

function generateClusteredData(n, m) {
    clusters = [];
    for (let i = 0; i < n; i++) {
        let cluster = [];
        let centerX = constrain(random(width), scatterFactor, width - scatterFactor);
        let centerY = constrain(random(height), scatterFactor, height - scatterFactor);
        for (let j = 0; j < m; j++) {
            let xOff = random(-scatterFactor, scatterFactor);
            let yOff = random(-scatterFactor, scatterFactor);
            let x = centerX + xOff;
            let y = centerY + yOff;

            cluster.push(new Datapoint(x, y, i));
        }
        clusters.push(cluster);
    }


    // update the matrix based on knn of each cell
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {

            let x = i * cellWidth;
            let y = j * cellHeight;
            // calculate knn for this cell
            let closestPoints = getClosestPoints(clusters, k, x, y);
            let tempclusteridarray = []

            for (let index = 0; index < closestPoints.length; index++) {

                tempclusteridarray.push(closestPoints[index].clusterid)
            }

            let mostrepeated = findMostRepeatedValue(tempclusteridarray)
            grid[i][j] = lightenHexColor(clusterColors[mostrepeated], 80)


        }
    }
}

function getClosestPoints(clusters, numClosest, x, y) {
    let allPoints = [];
    for (let cluster of clusters) {
        allPoints = allPoints.concat(cluster);
    }

    // Calculate distances and sort by distance
    allPoints.sort((a, b) => {
        let distA = dist(x, y, a.x, a.y);
        let distB = dist(x, y, b.x, b.y);
        return distA - distB;
    });

    // Get the closest points
    return allPoints.slice(0, numClosest);
}


function drawboundaries() {

    // Draw the grid based on the matrix
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * cellWidth;
            let y = j * cellHeight;
            let cellValue = grid[i][j];

            fill(cellValue)
            stroke(cellValue)
            //    strokeWeight(1)
            //  noStroke()

            rect(x, y, cellWidth, cellHeight);
        }
    }
}

function findMostRepeatedValue(arr) {
    if (arr.length === 0) {
        return null; // Return null for an empty array
    }

    // Create an object to count the occurrences of each value
    const count = {};
    let mostRepeatedValue = arr[0];
    let maxCount = 1;

    for (const value of arr) {
        if (count[value] === undefined) {
            count[value] = 1;
        } else {
            count[value]++;
            if (count[value] > maxCount) {
                maxCount = count[value];
                mostRepeatedValue = value;
            }
        }
    }

    return mostRepeatedValue;
}


function lightenHexColor(hex, factor) {
    // Parse the hex color code to an RGB representation
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate the new RGB values by increasing brightness
    const newR = Math.min(r + factor, 255);
    const newG = Math.min(g + factor, 255);
    const newB = Math.min(b + factor, 255);

    // Convert the new RGB values back to a hex color code
    const newHex = `#${newR.toString(16)}${newG.toString(16)}${newB.toString(16)}`;

    return newHex;
}


function drawaxis() {

    stroke(0)
    strokeWeight(1)
    fill(0)
    // Draw X-axis
    line(0, height / 2, width, height / 2);
    for (let x = 0; x < width; x += width / 20) {
        line(x, height / 2 - 5, x, height / 2 + 5);

    }

    // Draw Y-axis
    line(width / 2, 0, width / 2, height);
    for (let y = 0; y < height; y += height / 20) {
        line(width / 2 - 5, y, width / 2 + 5, y);

    }
}