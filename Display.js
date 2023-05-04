/*Resizing parent canvas to take up whole screen*/
var parent = document.getElementById("display");
parent.style.width = String(window.innerWidth) + "px";
parent.style.height = String(window.innerHeight) + "px";

/*Left in the 'parent' div*/
var screen = document.getElementById("screen");
screen.width = window.innerWidth * 2/3;
screen.height = window.innerHeight;

/*Right in the 'parent' div*/
var inputs = document.getElementById("inputs");
inputs.style.width = String(window.innerWidth * 1/3) + "px";
inputs.style.height = String(window.innerHeight) + "px";

/*Creates tab above inputs*/
var tabs = document.getElementById("tabs");
tabs.style.width = inputs.style.width;
tabs.style.height = String(window.innerHeight *1/10) + "px";

/*Reference dimensions of canvas when animating*/
var sWidth = screen.width;
var sHeight = screen.height;
var c = screen.getContext("2d");

var roadWidth = 150;
var radiusBig = 250;
var radiusSmall = 100;
var vehicle_height = 40;
var vehicle_width = vehicle_height;
var outer_ring = (radiusBig - radiusSmall)/4;
var loc1 = sHeight/2 - roadWidth/2 + roadWidth/4; //y-coordinate of the entrance to rounabout on left side, left lane
var loc2 = sWidth/2 + roadWidth/4;
var loc3 = sHeight/2 + roadWidth/4;
var loc4 = sWidth/2 - roadWidth/4;
//var loc1 = sWidth/2 + roadWidth/2 - vehicle_width/2 + roadWidth/4; //x-coordinate of the entrance to rounabout on top side, left lane (right on screen)
var wayPoints = [
    //Left entrance entering roundabout
    [sWidth/2 - radiusBig - vehicle_width/2, loc1],
    //Up entrance entering roundabout
    [loc2, sHeight/2 - radiusBig - vehicle_height/2],
    //Right entrance entering roundabout
    [sWidth/2 + radiusBig + vehicle_width/2, loc3],
    //Bottom entrance entering roundabout
    [loc4, sHeight/2 + radiusBig + vehicle_height/2]
];
var exitPoints = [
    //Right exit point IN roundabout
    [0, loc1],
    //Bottom exit point in roundabout
    [loc2, 0],
    //Left exit point in roundabout
    [0, loc3],
    //Top exit point in roundabout
    [loc4, 0]

];

function Road() {

    /*Creates big circle and main roads*/
    c.arc(sWidth/2, sHeight/2, radiusBig, 0, Math.PI*2, false);
    c.fillStyle = "grey";
    c.fill();

    c.fillRect(0, sHeight/2 - roadWidth/2, sWidth, roadWidth);
    c.fill();

    c.fillRect(sWidth/2 - roadWidth/2, 0, roadWidth, sHeight);
    c.fill();

    /*Creates concentric circle to fill the centre of roundabout green */    
    c.beginPath();
    c.moveTo(sWidth/2, sHeight/2)
    c.arc(sWidth/2, sHeight/2, radiusSmall, 0, Math.PI*2, false);
    c.fillStyle = "#09B051";
    c.fill();
    c.closePath();

    /*Creates road lines*/
    c.beginPath();

        /*Horizontal lines*/
        c.strokeStyle = "white";
        c.setLineDash([10, 10]);
        c.moveTo(0, sHeight/2);
        c.lineTo(sWidth/2 - radiusBig, sHeight/2);
        c.moveTo(sWidth/2 + radiusBig, sHeight/2);
        c.lineTo(sWidth, sHeight/2);
        c.stroke();
        
        /*Vertical lines*/
        c.moveTo(sWidth/2, sHeight);
        c.lineTo(sWidth/2, sHeight/2 + radiusBig);
        c.stroke();
        c.moveTo(sWidth/2, sHeight/2 - radiusBig);
        c.lineTo(sWidth/2, 0);
        c.stroke();

        /*Roundabout lines */
        c.moveTo(sWidth/2 + radiusSmall + (radiusBig-radiusSmall)/2, sHeight/2);
        c.arc(sWidth/2, sHeight/2, radiusSmall + (radiusBig-radiusSmall)/2, 0, Math.PI*2, false);
        c.stroke();

    c.closePath();
}
// have entrance and exit parameter values
class Vehicle {
    constructor(entrance, exit) {
        // entrance is from 0-3 and determines which entrance it comes in from
        this.entrance = entrance;
        this.exit = exit;
        this.wayPoints = wayPoints;
        this.height = vehicle_height;
        this.width = vehicle_width;
        this.sHeight = sHeight;
        this.sWidth = sWidth;
        this.roadWidth = roadWidth;
        this.outer_ring = outer_ring;
        this.radiusBig = radiusBig;
        this.radiusSmall = radiusSmall;
        this.loc1 = loc1;
        // enterx and entery are coordinates in roundabout lane for circular motion
        this.enterx = this.wayPoints[0][0] + this.outer_ring;
        this.entery = this.wayPoints[0][1];
        //universal speed to control car on straight road and roundabout.
        this.variable = 6;
        this.speed = this.variable + Math.random() * 4;
        this.dx = this.speed;
        this.dy = this.speed;
        this.fillStyle = "#1d3557";
        this.velCircle = (this.variable * 2.25)/400;
        this.speed_list = [this.speed, this.dx, this.dy, this.velCircle];
        this.lane_radius = this.radiusBig - this.outer_ring;
        this.small_lane_radius = this.radiusBig - this.outer_ring * 3;
        this.exitPoints = exitPoints;
        this.rotated = 0;
        this.index = 0;
        this.angle_dif = Math.asin((this.roadWidth/4)/(this.radiusBig-this.outer_ring));
        this.small_angle_dif = Math.asin((this.roadWidth/4)/(this.radiusBig- 3 * this.outer_ring));
        this.critical_gap = 40;
        if (this.entrance === 0) {
            this.x = -this.width/2; 
            this.y = this.loc1;
            // asin() value or this.angle_dif is angle between entrance and centre of circle. this is for smooth transition
            // without this value, very small or large angle changes would mess up if statements and the
            // car would "jump" when going into the roundabout
            if (this.exit === 1 || this.exit === 2) {
                this.radian = Math.PI * -1 - this.angle_dif;
            }
            else if (this.exit === 3 || this.exit === 0) {
                this.radian = Math.PI * -1 - this.small_angle_dif;
            }
        }

        else if (this.entrance === 1) {
            this.x = this.wayPoints[1][0]; 
            this.y = -this.height/2;
            if (this.exit === 2 || this.exit === 3) {
                this.radian = Math.PI/2 - this.angle_dif;
            }
            else if (this.exit === 0 || this.exit === 1) {
                this.radian = Math.PI/2 - this.small_angle_dif;
            }
            ;
        }
        else if (this.entrance === 2) {
            this.x = this.sWidth + this.width/2; 
            this.y = this.wayPoints[2][1]; 
            if (this.exit === 3 || this.exit === 0) {
                this.radian = Math.PI * 2 - this.angle_dif;
            }
            else if (this.exit === 1 || this.exit === 2) {
                this.radian = Math.PI * 2 - this.small_angle_dif;
            }
        }
        
        else if (this.entrance === 3) {
            this.x = this.sWidth/2 - this.roadWidth/4; 
            this.y = this.sHeight + this.height/2; 
            if (this.exit === 0 || this.exit === 1) {
                this.radian = Math.PI *7/2 - this.angle_dif;
            }
            else if (this.exit === 2 || this.exit === 3) {
                this.radian = Math.PI *7/2 - this.small_angle_dif;
            }
        }

    }
        //Spawn car to center of road-lane
    draw() {
        c.beginPath();
        c.fillStyle = this.fillStyle;
        //c.fillRect(this.x, this.y, this.width, this.height);
        c.arc(this.x, this.y, this.width/2, 0, Math.PI *2, false);
        c.fill();
        c.closePath();
     }
    //Animates car movement
    /*entrances are labelled 0 - 3 from the left clockwise
    exits are labelled 0 - 3 from left clockwise
    cars are randomly assigned two numbers, which determines their entrance and exit rout*/
    update() {
        // This wayPoint is where car waits to enter roundabout. the adding is 
        // to get it into the road.
        // discontinues vehicle if in contact with another car.
        // width is interchangeable with height becuase it's a circle

        if (this.entrance === 0) {
                // if another vehicle is in the entrance 0 zone

            if (this.exit === 0) {
                //enter left, exit left
                if (this.y <= this.exitPoints[2][1] && this.y > this.sHeight/2 && this.x < this.sWidth/2) {
                    this.x -= this.dx;
                }
                //this.rotated ensures by counting that the y-coordinate is not above exitPoints, but counts
                //in time for it to reach the destination and leaves. a bit sketch ik.

                else if (this.x >= this.wayPoints[0][0] + this.width/2 + this.outer_ring * 3) {
                    /*circular motion around roundabout. x moves according to sin graph, since it
                    increases then decreases, and y moves according to cos graph. this.radians <= pi
                    because the car is only travelling half way around the road.
                    The car's coordinates are based on the centre of the roundabout so it spins properly*/
                    this.radian -= this.velCircle;
  

                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                
                else if (this.x < this.wayPoints[0][0] + this.width/2 + this.outer_ring * 3) {
                    this.x += this.dx;
                }

            }
            else if (this.exit === 1) {
                //enter left, exit top
                if (this.x > this.exitPoints[3][0]) {
                    this.y -= this.dy;
                }

                else if (this.x >= this.wayPoints[0][0] + this.width/2 + this.outer_ring) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                
                else if (this.x < this.wayPoints[0][0] + this.width/2 + this.outer_ring) {
                    this.x += this.dx;
                }

            }
            else if (this.exit === 2) {
                //enter left, exit right
                if (this.y > this.exitPoints[0][1]) {
                    this.x += this.dx;
                }

                else if (this.x >= this.enterx + this.width/2) {
                    /*circular motion around roundabout. x moves according to sin graph, since it
                    increases then decreases, and y moves according to cos graph. this.radians <= pi
                    because the car is only travelling half way around the road.
                    The car's coordinates are based on the centre of the roundabout so it spins properly*/
                    this.radian -= this.velCircle;

                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                //remove outer_ring once it checks for traffic!!!!!!!!!!!//
                else if (this.x < this.wayPoints[0][0] + this.width/2 + this.outer_ring) {
                    this.x += this.dx;
                }
            }
            else if (this.exit === 3) {
                //enter left, exit bottom
                if (this.x < this.exitPoints[1][0] && this.y > this.sHeight/2) {
                    this.y += this.dy;
                }

                else if (this.x >= this.wayPoints[0][0] + this.width/2 + this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                
                else if (this.x < this.wayPoints[0][0] + this.width/2 + this.outer_ring * 3) {
                    this.x += this.dx;
                }
            }
        }
        else if (this.entrance === 1) {
            if (this.exit === 0) {
                //enter top, exit left
                if (this.y <= this.exitPoints[2][1] && this.x < this.sWidth/2) {
                    this.x -= this.dx;
                }

                else if (this.y >= this.wayPoints[1][1] + this.width/2 + this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                
                else if (this.y < this.wayPoints[1][1] + this.width/2 + this.outer_ring * 3) {
                    this.y += this.dy;
                }
            }
            else if (this.exit === 1) {
                //enter top, exit top
                if (this.x >= this.exitPoints[3][0] && this.x < this.sWidth/2 && this.y < this.sHeight/2) {
                    this.y -= this.dy;
                }


                else if (this.y >= this.wayPoints[1][1] + this.width/2 + this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                
                else if (this.y < this.wayPoints[1][1] + this.width/2 + this.outer_ring * 3) {
                    this.y += this.dy;
                }
            }
            else if (this.exit === 2) {
                // enter top, exit right
                if (this.y >= this.exitPoints[0][1]) {
                    this.x += this.dx;
                }


                else if (this.y >= this.wayPoints[1][1] + this.width/2 + this.outer_ring) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                
                else if (this.y < this.wayPoints[1][1] + this.width/2 + this.outer_ring) {
                    this.y += this.dy;
                }
            }
            else if (this.exit === 3) {
                //enter top, exit bottom
                if (this.x < this.exitPoints[1][0]) {
                    this.y += this.dy;

                }
                //roundabout
                else if (this.y >= this.wayPoints[1][1] + this.outer_ring + this.width/2) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                //leaving
                else if (this.y < this.wayPoints[1][1] + this.outer_ring + this.width/2) {
                    this.y += this.dy;
                }
            }
        }

        else if (this.entrance === 2) {
            if (this.exit === 0) {
                // Enter right, exit left
                if (this.y < this.exitPoints[2][1]) {
                    this.x -= this.dx;
                }
                else if (this.x <= this.wayPoints[2][0] - this.width/2 - this.outer_ring) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                else if (this.x > this.wayPoints[2][0] - this.outer_ring - this.width/2) {
                    this.x -= this.dx;
                }
            }
            else if (this.exit === 1) {
                //enter right, exit top
                if (this.x >= this.exitPoints[3][0] && this.x < this.sWidth/2 && this.y < this.sHeight/2) {
                    this.y -= this.dy;
                }
                else if (this.x <= this.wayPoints[2][0] - this.width/2 - this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                else if (this.x > this.wayPoints[2][0] - this.width/2 - this.outer_ring * 3) {
                    this.x -= this.dx;
                }
            }
            else if (this.exit === 2) {
                //Enter right, exit right
                if (this.y >= this.exitPoints[0][1] && this.y < this.sHeight/2 && this.x > this.sWidth/2) {
                    this.x += this.dx;
                }
                else if (this.x <= this.wayPoints[2][0] - this.width/2 - this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                else if (this.x > this.wayPoints[2][0] - this.width/2 - this.outer_ring * 3) {
                    this.x -= this.dx;
                }
            }
            else if (this.exit === 3) {
                // enter right, exit bottom
                if (this.x <= this.exitPoints[1][0]) {
                    this.y += this.dy;
                }
                else if (this.x <= this.wayPoints[2][0] - this.width/2 - this.outer_ring) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                else if (this.x > this.wayPoints[2][0] - this.width/2 - this.outer_ring) {
                    this.x -= this.dx;
                }
            }
        }
        
        else if (this.entrance === 3) {
            if (this.exit === 0) {
                //enter bottom exit left
                if (this.y <= this.exitPoints[2][1]) {
                    this.x -= this.dx;
                }
                else if (this.y <= this.wayPoints[3][1] - this.outer_ring - this.width/2) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                else if (this.y > this.wayPoints[3][1] - this.outer_ring - this.width/2) {
                    this.y -= this.dy;
                }
            }
            else if (this.exit === 1) {
                // enter bottom exit top
                if (this.x > this.exitPoints[3][0]) {
                    this.y -= this.dy;
                }
                else if (this.y <= this.wayPoints[3][1] - this.outer_ring - this.width/2) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.lane_radius;
                }
                else if (this.y > this.wayPoints[3][1] - this.outer_ring - this.width/2) {
                    this.y -= this.dy;
                }
            }
            else if (this.exit === 2) {
                // enter bottom, exit right
                if (this.y >= this.exitPoints[0][1] && this.x > this.sWidth/2) {
                    this.x += this.dx;
                }
                else if (this.y <= this.wayPoints[3][1] - this.width/2 - this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                else if (this.y > this.wayPoints[3][1] - this.width/2 - this.outer_ring * 3) {
                    this.y -= this.dy;
                }
            }
            else if (this.exit === 3) {
                if (this.x <= this.exitPoints[1][0] && this.x > this.sWidth/2 && this.y > this.sHeight/2) {
                    this.y += this.dy;
                }
                else if (this.y <= this.wayPoints[3][1] - this.width/2 - this.outer_ring * 3) {
                    this.radian -= this.velCircle;
                    this.x = this.sWidth/2 + Math.cos(this.radian) * this.small_lane_radius;
                    this.y = this.sHeight/2  - Math.sin(this.radian) * this.small_lane_radius;
                }
                else if (this.y > this.wayPoints[3][1] - this.width/2 - this.outer_ring * 3) {
                    this.y -= this.dy;
                }
            }
        }
        //removes objects from list if its outside the canvas screen
        if ((this.x - this.width/2 >= this.sWidth && this.y < this.sHeight/2) || 
        (this.x < this.sWidth/2 && this.y + this.width/2 <= 0) || 
        (this.x + this.width/2 <= 0 && this.y > this.sHeight/2) || 
        (this.x > this.sWidth/2 && this.y - this.width/2 >= this.sHeight)) 
        {
            this.index = vehicles.indexOf(this);
            if (this.index >= 0) {vehicles.splice(this.index, 1);}
        }


        this.draw();
    }
}

var lastSpawn = -1;
var timer = 0;
var spawnRate = 1000; //car spawns every 2 seconds
var vehicles = [];
var spawning = true;
var left_stop = false;
var colours = false;
var aggression = 0.2;
var carDensity = [0, 0, 0, 0, 0, 0, 0]; //starting values for graphs
var flowVelocity = [0, 0, 0, 0, 0, 0, 0];
var trafficFlow = [0, 0, 0, 0, 0, 0, 0];
var ctx = graph.getContext('2d');
var ctx2 = graph2.getContext("2d");
var ctx3 = graph3.getContext("2d");
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: carDensity,
        datasets: [{
            fill: true,
            backgroundColor: "#F1FAEE",
            lineTension: 0.5,
            borderColor: "#1d3557",
            borderWidth: 4,
            data: trafficFlow
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Car Density vs Traffic Flow',
                color: "#F1FAEE",

            },
            legend: {
                display: false,
                text: "toggle"
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
            y: {
                beginAtZero: true,
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
        },
    }
});
var chart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: trafficFlow,
        datasets: [{
            fill: true,
            backgroundColor: "#F1FAEE",
            lineTension: 0.5,
            borderColor: "#1d3557",
            borderWidth: 4,
            data: flowVelocity
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Flow Velocity vs. Traffic Flow',
                color: "#F1FAEE",

            },
            legend: {
                display: false,
                text: "toggle"
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
            y: {
                beginAtZero: true,
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
        },
    }
    });
var chart3 = new Chart(ctx3, {
    type: 'line',
    data: {
        labels: flowVelocity,
        datasets: [{
            fill: true,
            backgroundColor: "#F1FAEE",
            lineTension: 0.5,
            borderColor: "#1d3557",
            borderWidth: 4,
            data: carDensity
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Flow Velocity vs. Car Density',
                color: "#F1FAEE",

            },
            legend: {
                display: false,
                text: "toggle"
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
            y: {
                beginAtZero: true,
                display: true,
                grid: {
                    drawBorder: true,
                    display: false,
                    borderColor: "#F1FAEE",
                    borderWidth: 4,
                },
                ticks: {
                    color: "#F1FAEE"
                }
            },
        },
    }
    });

function Colours() {
    if (colours === false) {
        colours = true;
    }
    else if (colours === true) {
        colours = false;
        for (var i=0; vehicles.length; i++) {
            vehicles[i].fillStyle = "#1d3557";
        }
    }
}

function check(set) {
    //check if car is in contact with each other - left road for now
    //set=0 means its coming from left or right; set=1 meants its coming from top or bottom
    for (var i=0; i<vehicles.length; i++) {
        for (var r=0; r<vehicles.length; r++) {
            // Entrance 0 or left OR Entrance 2 or right
            if (set === 0) {
                if (vehicles[i] === vehicles[r]) continue;
                if (Math.abs(vehicles[i].x - vehicles[r].x) - vehicles[i].critical_gap <= vehicles[i].width && vehicles[i].y === vehicles[r].y) {
                    if (vehicles[i].x < vehicles[i].sWidth/2) {
                        if (vehicles[i].x >= vehicles[i].sWidth/2 - vehicles[i].radiusBig || vehicles[r].x >= vehicles[i].sWidth/2 - vehicles[i].radiusBig) continue;
                        if (vehicles[i].x < vehicles[r].x) {
                            vehicles[i].dx = vehicles[r].dx;
                            vehicles[i].dy = vehicles[r].dy;
                        }
                        if (vehicles[i].x > vehicles[r].x) {
                            vehicles[r].dx = vehicles[i].dx;
                            vehicles[r].dy = vehicles[i].dy;
                        }
                    }
                    if (vehicles[i].x > vehicles[i].sWidth/2) {
                        if (vehicles[i].x <= vehicles[i].sWidth/2 + vehicles[i].radiusBig || vehicles[r].x <= vehicles[i].sWidth/2 + vehicles[i].radiusBig) continue;
                        if (vehicles[i].x > vehicles[r].x) {
                            vehicles[i].dx = vehicles[r].dx;
                            vehicles[i].dy = vehicles[r].dy;
                        }
                        if (vehicles[i].x < vehicles[r].x) {
                            vehicles[r].dx = vehicles[i].dx;
                            vehicles[r].dy = vehicles[i].dy;
                        }
                    }
                }   
            }
            // Entrance up or down
            if (set === 1) {
                if (vehicles[i] === vehicles[r]) continue;
                if (Math.abs(vehicles[i].y - vehicles[r].y) <= vehicles[i].height + vehicles[i].critical_gap && vehicles[i].x === vehicles[r].x) {
                    if (vehicles[i].y < vehicles[i].sHeight/2) {
                        if (vehicles[i].y >= vehicles[i].sHeight/2 - vehicles[i].radiusBig || vehicles[r].y >= vehicles[r].sHeight/2 - vehicles[r].radiusBig) continue;
                        if (vehicles[i].y < vehicles[r].y) {
                            vehicles[i].dx = vehicles[r].dx;
                            vehicles[i].dy = vehicles[r].dy;
                        }
                        if (vehicles[i].y > vehicles[r].y) {
                            vehicles[r].dx = vehicles[i].dx;
                            vehicles[r].dy = vehicles[i].dy;
                        }
                    }
                    if (vehicles[i].y > vehicles[i].sHeight/2) {
                        if (vehicles[i].y <= vehicles[i].sHeight/2 + vehicles[i].radiusBig || vehicles[r].y <= vehicles[r].sHeight/2 + vehicles[r].radiusBig) continue;
                        if (vehicles[i].y > vehicles[r].y) {
                            vehicles[i].dx = vehicles[r].dx;
                            vehicles[i].dy = vehicles[r].dy;
                        }
                        if (vehicles[i].y < vehicles[r].y) {
                            vehicles[r].dx = vehicles[i].dx;
                            vehicles[r].dy = vehicles[i].dy;
                        }
                    }
                }
            }
        }
    }
}

function animate() {
    //Updates car density by seeing length of vehicles list
    //assuming the area of the cars are in 40 metres squared, the following calculations can be made of 0.00004
    now = Date.now();
    //timer stops graph spazzing out
    if (now >= 600 + timer) {
        timer = now;
        //car density vs. traffic flow
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(vehicles.length * parseInt(document.getElementById("speedLimit").value)/100);
        chart.data.labels.shift();
        chart.data.labels.push(vehicles.length);

        chart2.data.datasets[0].data.shift();
        chart2.data.datasets[0].data.push(vehicles.length * parseInt(document.getElementById("speedLimit").value)/100);
        chart2.data.labels.shift();
        chart2.data.labels.push(parseInt(document.getElementById("speedLimit").value)/100);

        chart3.data.datasets[0].data.shift();
        chart3.data.datasets[0].data.push(vehicles.length);
        chart3.data.labels.shift();
        chart3.data.labels.push(parseInt(document.getElementById("speedLimit").value)/100);


        chart.update();
        chart2.update();
        chart3.update();

    }
    
     //Updates traffic flow by using formula Q=DV
     //var tFlow = vehicles.length * vehicles[0].speed;

    //Checks slider values
    for (var i=0; i<vehicles.length; i++) {
        //Speed changes - dividing big number by 100 to make sliders more smooth
        vehicles[i].variable = parseInt(document.getElementById("speedLimit").value)/100;
        vehicles[i].speed = (vehicles[i].variable + Math.random() * 4);
        vehicles[i].dx = vehicles[i].speed;
        vehicles[i].dy = vehicles[i].speed;
        vehicles[i].velCircle = (vehicles[i].variable * 2.25)/400;
        vehicles[i].critical_gap = parseInt(document.getElementById("criticalGap").value);
    }
    spawnRate = -1 * parseInt(document.getElementById("carDensity").value);
    aggression = parseInt(document.getElementById("aggression").value)/10000;

    //This is so program doesn't beep when the user is in the main menu
    //Aggression determines probability of honking
    if (aggression * vehicles.length/8> Math.random() && Back.disabled === false) {
        honk = new Audio("honk.mp3");
        honk.play();
    }

    // Spawn rate system
    var current = Date.now();
    //Controls car density by preventing spawning if there is another car there to prevent overlapping
    for (var q=0; q<vehicles.length; q++) {
        if ((vehicles[q].x <= vehicles[q].critical_gap + vehicles[q].width/2 && vehicles[q].y < vehicles[q].sHeight/2) || (vehicles[q].x >= vehicles[q].sWidth - vehicles[q].critical_gap - vehicles[q].width/2 && vehicles[q].y > vehicles[q].sHeight/2) || (vehicles[q].y >= vehicles[q].sHeight - vehicles[q].critical_gap - vehicles[q].width/2 && vehicles[q].x < vehicles[q].sWidth/2) || (vehicles[q].y <= vehicles[q].critical_gap + vehicles[q].width/2 && vehicles[q].x > vehicles[q].sWidth/2)) {
            spawning = false;
        }
        else {
            spawning = true;
        }
    }
    //push objects to list if elapsed time is greater than spawn rate
    if (current >= spawnRate + lastSpawn && spawning) {
        lastSpawn = current;
        spawnVehicles();
    }
    // checks whether other vehicles are in the entrance zones
    var lead_left = vehicles[0];
    var lead_left_dist = 100000;
    var lead_up = vehicles[0];
    var lead_up_dist = 100000;
    var lead_right = vehicles[0];
    var lead_right_dist = 100000;
    var lead_down = vehicles[0];
    var lead_down_dist = 100000;
    var travel = vehicles.length;
    //queues would have probably been better to use here, but I too deep into using this method...
    for (var r=0; r<vehicles.length; r++) {
        //Leading car left entrance by finding car with closest distance to entrance
        //Finding lead left
        if (vehicles[r].x <= vehicles[r].sWidth/2 - vehicles[r].radiusBig && vehicles[r].sWidth/2 - vehicles[r].radiusBig - vehicles[r].x < lead_left_dist && vehicles[r].y < vehicles[r].sHeight/2) {
            lead_left = vehicles[r];
            lead_left_dist = vehicles[r].sWidth/2 - vehicles[r].radiusBig - vehicles[r].x;
        }
        //Finding lead up
        else if (vehicles[r].y <= vehicles[r].sHeight/2 - vehicles[r].radiusBig && vehicles[r].sHeight/2 - vehicles[r].radiusBig - vehicles[r].y < lead_up_dist && vehicles[r].x > vehicles[r].sWidth/2) {
            lead_up = vehicles[r];
            lead_up_dist = vehicles[r].sHeight/2 - vehicles[r].radiusBig - vehicles[r].y;
        }
        //Finding lead right
        else if (vehicles[r].x >= vehicles[r].sWidth/2 + vehicles[r].radiusBig && vehicles[r].x - vehicles[r].sWidth/2 - vehicles[r].radiusBig < lead_right_dist && vehicles[r].y > vehicles[r].sHeight/2) {
            lead_right = vehicles[r];
            lead_right_dist = vehicles[r].x - vehicles[r].sWidth/2 - vehicles[r].radiusBig;
        }
        //Finding lead down
        else if (vehicles[r].y >= vehicles[r].sHeight/2 + vehicles[r].radiusBig && vehicles[r].y - vehicles[r].sHeight/2 - vehicles[r].radiusBig < lead_down_dist && vehicles[r].x < vehicles[r].sWidth/2) {
            lead_down = vehicles[r];
            lead_down_dist = vehicles[r].y - vehicles[r].sHeight/2 - vehicles[r].radiusBig;
        }
        if (colours) {vehicles[r].fillStyle = "#1d3557";}
    }
    //identifies lead car and colours it

    // The car can stop roughly in the middle of the screen to allow for variation in screen widths - LEFT
    if (typeof lead_left != "undefined" && lead_left.x <= lead_left.sWidth/2 - lead_left.radiusBig && lead_left.x > lead_left.width/2 + lead_left.critical_gap && lead_left.y < lead_left.sHeight/2) {
        if (colours) {lead_left.fillStyle = "#ff0000";}
        for (var i=0; i<vehicles.length; i++) {
            if (vehicles[i] === lead_left) continue;
            //stops lead if car is in way
            if (vehicles[i].x >= vehicles[i].sWidth/2 - vehicles[i].radiusBig && vehicles[i].x <= vehicles[i].sWidth/2 - vehicles[i].radiusSmall && vehicles[i].y <= vehicles[i].sHeight/2 + vehicles[i].roadWidth/2 && vehicles[i].y >= vehicles[i].sHeight/2 - vehicles[i].roadWidth/2) {
                lead_left.dx = 0;
                travel --;
                if (colours) {vehicles[i].fillStyle = '#000000';}
            }
        }    
        // aligns cars if the lead speed is 0
        if (lead_left.dx === 0) {
            check(0);
            
        }
        // aligns cars and travels
        if (travel === vehicles.length) {
            lead_left.dx = lead_left.speed;
            travel = vehicles.length;
            check(0);
        }
    } 
    //UP
    if (typeof lead_up != "undefined" && lead_up.y <= lead_up.sHeight/2 - lead_up.radiusBig && lead_up.y > lead_up.height/2 + lead_up.critical_gap && lead_up.x > lead_up.sWidth/2) {
        if (colours) {lead_up.fillStyle = "#ff0000";}
        for (var i=0; i<vehicles.length; i++) {
            if (vehicles[i] === lead_up) continue;
            //stops lead if car is in way
            if (vehicles[i].y >= vehicles[i].sHeight/2 - vehicles[i].radiusBig && vehicles[i].y <= vehicles[i].sHeight/2 - vehicles[i].radiusSmall && vehicles[i].x >= vehicles[i].sWidth/2 - vehicles[i].roadWidth/2 && vehicles[i].x <= vehicles[i].sWidth/2 + vehicles[i].roadWidth/2) {
                lead_up.dy = 0;
                travel --;
                if (colours) {vehicles[i].fillStyle = '#000000';}
            }
        }
        //aligns cars if the lead speed is 0
        if (lead_up.dy === 0) {
            check(1);
        }
        // aligns cars and travels
        if (travel === vehicles.length) {
            lead_up.dy = lead_up.speed;
            check(1);
        }
    } 
    //RIGHT
    if (typeof lead_right != "undefined" && lead_right.x >= lead_right.sWidth/2 + lead_right.radiusBig && lead_right.x < lead_right.sWidth - lead_right.width/2 - lead_right.critical_gap && lead_right.y > lead_right.sHeight/2) {
        if (colours) {lead_right.fillStyle = "#ff0000";}
        for (var i=0; i<vehicles.length; i++) {
            if (vehicles[i] === lead_right) continue;
            //stops lead if car is in way
            if (vehicles[i].x <= vehicles[i].sWidth/2 + vehicles[i].radiusBig && vehicles[i].x >= vehicles[i].sWidth/2 + vehicles[i].radiusSmall && vehicles[i].y <= vehicles[i].sHeight/2 + vehicles[i].roadWidth/2 && vehicles[i].y >= vehicles[i].sHeight/2 - vehicles[i].roadWidth/2) {
                lead_right.dx = 0;
                travel --;
                if (colours) {vehicles[i].fillStyle = '#000000';}
            }
        }    
        // aligns cars if the lead speed is 0
        if (lead_right.dx === 0) {
            check(0);
        }
        // aligns cars and travels
        if (travel === vehicles.length) {
            lead_right.dx = lead_right.speed;
            travel = vehicles.length;
            check(0);
        }
    } 
    //DOWN
    if (typeof lead_down != "undefined" && lead_down.y >= lead_down.sHeight/2 + lead_down.radiusBig && lead_down.y < lead_down.sHeight - lead_down.height/2 - lead_down.critical_gap && lead_down.x < lead_down.sWidth/2) {
        if (colours) {lead_down.fillStyle = "#ff0000";}
        for (var i=0; i<vehicles.length; i++) {
            if (vehicles[i] === lead_down) continue;
            //stops lead if car is in way
            if (vehicles[i].y <= vehicles[i].sHeight/2 + vehicles[i].radiusBig && vehicles[i].y >= vehicles[i].sHeight/2 + vehicles[i].radiusSmall && vehicles[i].x >= vehicles[i].sWidth/2 - vehicles[i].roadWidth/2 && vehicles[i].x <= vehicles[i].sWidth/2 + vehicles[i].roadWidth/2) {
                lead_down.dy = 0;
                travel --;
                if (colours) {vehicles[i].fillStyle = '#000000';}
            }
        }
        //aligns cars if the lead speed is 0
        if (lead_down.dy === 0) {
            check(1);
        }
        // aligns cars and travels
        if (travel === vehicles.length) {
            lead_down.dy = lead_down.speed;
            check(1);
        }
    } 
    
    requestAnimationFrame(animate);
    c.clearRect(0, 0, sWidth, sHeight);
    Road();

    //Cars stop before roundabout if there is another object in the way
    //Cars follow each other at the same speed if they interact
    
    for (var i=0; i<vehicles.length; i++) {                   
        vehicles[i].update();
    }
}
function spawnVehicles() {
    // for each elapsed time that is greater than or equal to spawn rate, another car object is pushed into array
    vehicles.push(new Vehicle(Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)));
}

/*Run two for loops:
1. To create and push vehicle objects into an array;
2. To iterate through each object in the array and animate them in the animate function.*/
Road();
animate();