var Example = Example || {};

// const SuisseRegular = new FontFace("SuisseRegular", "url(/fonts/SuisseIntl-Regular.otf)");
// SuisseRegular.load().then((loadedFont) => {
//   document.fonts.add(loadedFont);
// });

// const SuisseBlack = new FontFace("SuisseBlack", "url(/fonts/SuisseIntl-Black.otf)");
// SuisseBlack.load().then((loadedFont) => {
//   document.fonts.add(loadedFont);
// });

Example.ballPool = function () {
  try {
    if (typeof MatterWrap !== "undefined") {
      // either use by name from plugin registry (Browser global)
      Matter.use("matter-wrap");
    } else {
      // or require and use the plugin directly (Node.js, Webpack etc.)
      Matter.use(require("matter-wrap"));
    }
  } catch (e) {
    // could not require the plugin or install needed
  }

  var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Bodies = Matter.Bodies;

  // create engine
  var engine = Engine.create(),
    world = engine.world;

  // WIDTH: 800
  //   HEIGHT: 600

  // create renderer
  var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: window.innerWidth,
      height: window.innerHeight,
      background: "transparent",
      wireframes: false,
    },
  });

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);

  const width = window.innerWidth;
  const height = window.innerHeight;

  Composite.add(world, [
    // floor
    Bodies.rectangle(width / 2, height + 25, width + 400, 50, {
      isStatic: true,
      render: { fillStyle: "#060a19" },
    }),

    // left wall
    Bodies.rectangle(-25, height / 2, 50, height * 2, {
      isStatic: true,
      render: { fillStyle: "#060a19" },
    }),

    // right wall
    Bodies.rectangle(width + 25, height / 2, 50, height * 2, {
      isStatic: true,
      render: { fillStyle: "#060a19" },
    }),

    // optional ceiling
    // Bodies.rectangle(width / 2, -25, width + 400, 50, { isStatic: true, render: { fillStyle: "#060a19" } }),
  ]);
  // Create 5 labeled spheres stacked vertically
  const letters = ["B", "I", "N", "G", "O"];

  const stack = Composites.stack(100, 0, 1, 5, 10, 10, function (x, y, column, row) {
    return Bodies.circle(x, y, 100, {
      restitution: 1.25,
      friction: 0,
      render: { fillStyle: "#E29CFF" },
      customLabel: letters[row % letters.length],
      customOffset: {
        x: (Math.random() - 0.5) * 50, // random horizontal offset once
        y: (Math.random() - 0.5) * 50, // random vertical offset once
      },
    });
  });

  Composite.add(world, [stack]);

  Matter.Events.on(render, "beforeRender", function () {
    const ctx = render.context;
    ctx.save();
    ctx.font = "bold 170px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#69180E";
    ctx.fillText("TATTOO", render.options.width / 2, render.options.height / 2);
    ctx.restore();
  });

  Matter.Events.on(render, "afterRender", function () {
    const context = render.context;
    context.font = "bold 60px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "white";

    const allBodies = Composite.allBodies(engine.world);
    allBodies.forEach((body) => {
      if (body.circleRadius && body.customLabel) {
        const position = body.position;
        const angle = body.angle;

        context.save();
        context.translate(position.x + body.customOffset.x, position.y + body.customOffset.y);
        context.rotate(angle); // rotate canvas by the body’s current angle
        context.fillText(body.customLabel, 0, 0);

        context.restore();
      }
    });
  });

  // add mouse control
  var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

  Composite.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: window.innerWidth, y: window.innerHeight },
  });

  // wrapping using matter-wrap plugin
  var allBodies = Composite.allBodies(world);

  for (var i = 0; i < allBodies.length; i += 1) {
    allBodies[i].plugin.wrap = {
      min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
      max: { x: render.bounds.max.x + 100, y: render.bounds.max.y },
    };
  }

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
  };
};

Example.ballPool.title = "Ball Pool";
Example.ballPool.for = ">=0.14.2";

if (typeof module !== "undefined") {
  module.exports = Example.ballPool;
}
