//Deals with buttons and switching screens
var Traffic = document.getElementById("Traffic");
var Stats = document.getElementById("Stats");
var Back = document.getElementById("Back");
var screen_traffic = document.getElementById("secondary_screen");
var screen_stats = document.getElementById("stats_screen");
var play = document.getElementById("display");
var main_menu = document.getElementById("main_menu");
var Start = document.getElementById("start");
var About = document.getElementById("about");
var Exit = document.getElementById("exit");
var graph = document.getElementById("graph");
var graph2 = document.getElementById("graph2");
var graph3 = document.getElementById("graph3");
var about_screen = document.getElementById("about_screen");
var back_about = document.getElementById("back_about");
main_menu.style.height = String(window.innerHeight) + "px";
main_menu.style.width = String(window.innerWidth) + "px";
Start.style.height = String(0.1 * window.innerHeight) + "px";
Start.style.width = String(0.3 * window.innerWidth) + "px";
About.style.height = String(0.1 * window.innerHeight) + "px";
About.style.width = String(0.3 * window.innerWidth) + "px";
Exit.style.height = String(0.1 * window.innerHeight) + "px";
Exit.style.width = String(0.3 * window.innerWidth) + "px";
back_about.style.height = String(0.1 * window.innerHeight) + "px";
back_about.style.width = String(0.2 * window.innerWidth) + "px";
about_screen.style.height = String(window.innerHeight) + "px";
about_screen.style.width = String(window.innerWidth) + "px";
graph.width = window.innerWidth/3;
//9/10 for the max height
graph.height = window.innerHeight * 3/10;
graph2.height = window.innerHeight *3/10;
graph2.width = window.innerWidth/3;
graph3.height = window.innerHeight * 3/10;
graph3.width = window.innerWidth/3;
//centers buttons
About.style.bottom = String((0.5 - (0.5 * 0.1 * window.innerHeight)/window.innerHeight)*100) + "%";
About.style.right = String((0.5 - (0.5 * 0.3 * window.innerWidth)/window.innerWidth)*100) + "%";
Start.style.bottom = String((0.5 + 2*(0.5 * 0.1 * window.innerHeight)/window.innerHeight)*100) + "%";
Start.style.right = String((0.5 - (0.5 * 0.3 * window.innerWidth)/window.innerWidth)*100) + "%";
Exit.style.bottom = String((0.5 - 4*(0.5 * 0.1 * window.innerHeight)/window.innerHeight)*100) + "%";
Exit.style.right = String((0.5 - (0.5 * 0.3 * window.innerWidth)/window.innerWidth)*100) + "%";

//disables button based on whether it's clicked
function Trafficfunc() {
    Traffic.disabled = true;
    Stats.disabled = false;
    Back.disabled = false;
    
}
function Statsfunc() {
    Traffic.disabled = false;
    Stats.disabled = true;
    Back.disabled = false;
}

function Backfunc() {
    Traffic.disabled = false;
    Stats.disabled = false;
    Back.disabled = true;
}
function Startfunc() {
    Back.disabled = false;
    Traffic.disabled = true;
}
function finish() {
    close();
}
//show stats screen if button is called
Stats.addEventListener("click", () =>{
    screen_traffic.style.display = "none";
    play.style.display = "block";
    screen_stats.style.display = "block";
    graph.style.display = "block";
    graph2.style.display = "block";
    graph3.style.display = "block";
})

//show traffic screen if button is called
Traffic.addEventListener("click", () =>{
    screen_stats.style.display = "none";
    play.style.display = "block";
    screen_traffic.style.display = "block";
    graph.style.display = "none";
    graph2.style.display = "none";
    graph3.style.display = "none";
})
//goes to home screen
Back.addEventListener("click", () =>{
    screen_stats.style.display = "none";
    screen_traffic.style.display = "none";
    play.style.display = "none";
    main_menu.style.display = "block";
    graph.style.display = "none";
    graph2.style.display = "none";
    graph3.style.display = "none";
})
//goes to the main traffic screen
Start.addEventListener("click", () =>{
    screen_stats.style.display = "none";
    play.style.display = "block";
    screen_traffic.style.display = "block";
    main_menu.style.display = "none";
})
//goes to about screen
About.addEventListener("click", () =>{
    screen_stats.style.display = "none";
    play.style.display = "none";
    screen_traffic.style.display = "none";
    main_menu.style.display = "none";
    about_screen.style.display = "block";
})
//goes from about screen to main menu
back_about.addEventListener("click", () =>{
    main_menu.style.display = "block";
    about_screen.style.display = "none";
})
