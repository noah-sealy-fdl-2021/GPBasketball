// main file 
// imports
var Matter = require('matter-js');
var $ = require('jquery');

// matter-js aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse;

var engine = Engine.create();

var render = Render.create({
                element: document.getElementById("matter"),
                engine: engine,
                options: {
                    width: 800,
                    height: 400,
                    wireframes: false
                }
            });

// draw 
Engine.run(engine);
Render.run(render);

// create bodies

var ball =              Bodies.circle(150, 200, 20, { render: { fillStyle: 'orange' }, density: 0.004 });  
var anchor =            { x: 150, y: 200 };
var elastic =           Matter.Constraint.create({
                            pointA: anchor,
                            bodyB: ball,
                            stiffness: 0.05
                        });
var backboard =         Bodies.rectangle(770, 110, 20, 140, { render: { fillStyle: 'white' }, isStatic: true });
var net_horiztonal =    Bodies.rectangle(720, 140, 80, 10, { render: { fillStyle: 'red' }, isStatic: true });
var net_vertical =      Bodies.rectangle(680, 110, 10, 70, { render: { fillStyle: 'red' }, isStatic: true });
var court =             Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

World.add(engine.world, [ball, elastic, backboard, net_vertical, net_horiztonal, court]);
var shot_ball = ball;

// add mouse control
var mouse = Mouse.create(render.canvas);

var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    }
});

World.add(engine.world, mouseConstraint);
render.mouse = mouse;
var score = 0;

var goal = 0

// throwing event
Events.on(engine, 'afterUpdate', function() {
    // check for shot
    if (mouseConstraint.mouse.button === -1 && (ball.position.x > 170 || ball.position.y < 0)) {
        // removes current ball in the air
        shot_ball = ball;
        ball =  Bodies.circle(150, 200, 20, { render: { fillStyle: 'orange' }, density: 0.004 });  
        World.add(engine.world, ball);
        elastic.bodyB = ball;
    }
});

//var take = 0;
/*
Events.on(engine, 'afterUpdate', function() {

    // check for win
    if ((shot_ball.position.x >= 730 && shot_ball.position.x <= 810) && (shot_ball.position.y >= 105 && shot_ball.position.y <= 175)) {
        console.log("score!");
        Body.setPosition(shot_ball, { x: 0, y: 0});
        World.remove(engine.world, shot_ball);
        goal = 1;
    }
    
});
*/
function shoot (ball, x_force, y_force) {
    Body.applyForce(ball, { x: ball.position.x, y: ball.position.y }, { x: x_force, y: y_force });
}

/* GP STUFF */

// GP Initialize
var generation = 1;
var take = 0;
var track = 0;
var activeShooters = [];
var fitness = [];
var familyTree = [];

// random start
for (i = 0; i < 3; i++) {
    var child = { x: Math.random(), y: -1 * Math.random() };
    activeShooters.push(child);
    fitness.push(0);
}

// GP Loop

Events.on(engine, 'afterUpdate', function () {

    var size = activeShooters.length;
    if (take % 100 == 0) {
        // run the tests!
        if (track < size) {
            shoot(ball, activeShooters[track].x, activeShooters[track].y);

            // ball is specifically in the net
            if ((shot_ball.position.x >= 730 && shot_ball.position.x <= 810) && (shot_ball.position.y >= 105 && shot_ball.position.y <= 175)) {
                console.log("score!");
                fitness[track] = 3;
                Body.setPosition(shot_ball, { x: 0, y: 0});
                World.remove(engine.world, shot_ball);       
            // ball is under the net
            } else if (shot_ball.position.x >= 730 && shot_ball.position.x < 810) {
                fitness[track] = 1;
            // ball is somehwere close to the front of the net
            } else if (shot_ball.position.x >= 650 && shot_ball.position.x < 730) {
                fitness[track] = 0.5;
            } else {
                fitness[track] = 0.1;
            }

            track += 1;

        }

        // print some stuff to page
        // is this the best spot for this??
        /*
        $('#generation').text("Generation: " + generation);
        $('#team').text("Team: " + track);
        $('#fitness').text("Fitness: " + fitness);
        */
        // print player to family tree
        $('#family_tree').append('<p>' + activeShooters[track-1].x + ', ' + activeShooters[track-1].y + '</p>');

        // evaluate fitness
        // this means that evaluation is over
        // each generation, old generation gets dropped
        if (track == size) {
            // tell family tree there is a new generation!
            $('#family_tree').text('');
            $('#generation').text('Generation ' + generation);
            var rouletteWheel = [];
            // make roulette wheel
            for (i = 0; i <= fitness.length; i++) {
                var amount = fitness[i] * 10;
                for (n = 0; n < amount; n++) {
                    rouletteWheel.push(activeShooters[i]);
                }
            }
        
            // for each member of population
            for (i = 0; i < size; i++) {

                // why only 2 parents?
                // I'm not good with variable names, with these "parent" names I do not mean to misgender anyone...
                var dad = {x:0,y:0};
                var mum = {x:0,y:0};

                // sample parents from roulette wheel
                var sample = Math.floor(Math.random() * rouletteWheel.length);
                //console.log(sample);
                dad.x = rouletteWheel[sample].x;
                dad.y = rouletteWheel[sample].y;

                sample = Math.floor(Math.random() * rouletteWheel.length);
                //console.log(sample);
                mum.x = rouletteWheel[sample].x;
                mum.y = rouletteWheel[sample].y;

                // reproduce! 
                // parent 1 gives x force
                // parent 2 gives y force
                // this could turn into taking an average of the two... lots of playing around required :O
                activeShooters[i] = { x: dad.x, y: mum.y };

                //mutation???
            }
       
            // start over with the next generation!
            generation += 1;
            track = 0;
        }

    }
    take += 1;

});
