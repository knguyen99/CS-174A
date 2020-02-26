window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 10, 20), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                torus: new Torus(15, 15),
                torus2: new (Torus.prototype.make_flat_shaded_version())(15, 15),

                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                //        (Requirement 1)
                sphere1: new Subdivision_Sphere(4),
                sphere2: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
                sphere3: new Subdivision_Sphere(3),
                sphere4: new Subdivision_Sphere(4),
                sphere5: new Subdivision_Sphere(4),
                sphere6: new (Subdivision_Sphere.prototype.make_flat_shaded_version())(1)
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .2}),
                    ring: context.get_instance(Ring_Shader).material(),

                    // TODO:  Fill in as many additional material objects as needed in this key/value table.
                    //        (Requirement 1)
                    sun: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: 1}),
                    
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View solar system", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("Attach to planet 1", ["1"], () => this.attached = () => this.planet_1);
            this.key_triggered_button("Attach to planet 2", ["2"], () => this.attached = () => this.planet_2);
            this.new_line();
            this.key_triggered_button("Attach to planet 3", ["3"], () => this.attached = () => this.planet_3);
            this.key_triggered_button("Attach to planet 4", ["4"], () => this.attached = () => this.planet_4);
            this.new_line();
            this.key_triggered_button("Attach to planet 5", ["5"], () => this.attached = () => this.planet_5);
            this.key_triggered_button("Attach to moon", ["m"], () => this.attached = () => this.moon);
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


            // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
            

            //this.shapes.torus2.draw(graphics_state, Mat4.identity(), this.materials.test);
            
            //sun stuff
            let sun_controls = Mat4.identity();
            let sun_radius = 2 + Math.sin(.2*Math.PI*t);
            let sun_color = .5+.5*Math.sin(.2*Math.PI*t);

            sun_controls = sun_controls.times(Mat4.scale([sun_radius,sun_radius,sun_radius]));
            graphics_state.lights = [new Light(Vec.of(0,0,0,1), Color.of(sun_color,0,1-sun_color,1), 10**sun_radius)];
            this.shapes.sphere1.draw(graphics_state, sun_controls, this.materials.sun.override({color: Color.of(sun_color,0,1-sun_color,1)}));

            
            //planet 1
            let planet1_controls = Mat4.identity();
            planet1_controls = planet1_controls.times(Mat4.rotation(t,Vec.of(0,1,0)))
                                                .times(Mat4.translation([5,0,0]))
                                                .times(Mat4.rotation(t,Vec.of(0,1,0)))
                                                .times(Mat4.scale([1,1,1]));
            this.shapes.sphere2.draw(graphics_state,planet1_controls,this.materials.test.override({ color: Color.of(.37,.3,.5,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 0,
                                                                                                    diffusivity: 1}));    

            //planet 2                                                                                                                                                                     
            let planet2_controls = Mat4.identity();
            planet2_controls = planet2_controls.times(Mat4.rotation(t*.8,Vec.of(0,1,0)))
                                                .times(Mat4.translation([8,0,0]))
                                                .times(Mat4.rotation(t,Vec.of(0,1,0)))
                                                .times(Mat4.scale([1,1,1]));
                                  
            this.shapes.sphere3.draw(graphics_state,planet2_controls,this.materials.test.override({ color: Color.of(.3,.66,.6,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 1,
                                                                                                    diffusivity: .25,
                                                                                                    gouraud: (Math.floor(t)%2)}));

            //planet 3                                                                                                                                                                     
            let planet3_controls = Mat4.identity();
            planet3_controls = planet3_controls.times(Mat4.rotation(t*.6,Vec.of(0,1,0)))
                                                .times(Mat4.translation([11,0,0]))
                                                .times(Mat4.rotation(t,Vec.of(1,1,1)))
                                                .times(Mat4.scale([1,1,1]));
            this.shapes.sphere4.draw(graphics_state,planet3_controls,this.materials.test.override({ color: Color.of(.5,.32,.12,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 1,
                                                                                                    diffusivity: 1}));
            let planet3_rings = planet3_controls.times(Mat4.scale([1,1,.1]));
            /*this.shapes.torus.draw(graphics_state,planet3_rings,this.materials.test.override({ color: Color.of(.5,.32,.12,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 1,
                                                                                                    diffusivity: 1}));
            */
            this.shapes.torus.draw(graphics_state,planet3_rings, this.materials.ring);
            
            //planet 4
            let planet4_controls = Mat4.identity();
            planet4_controls = planet4_controls.times(Mat4.rotation(t*.4,Vec.of(0,1,0)))
                                                .times(Mat4.translation([14,0,0]))
                                                .times(Mat4.rotation(t,Vec.of(0,1,0)))
                                                .times(Mat4.scale([1,1,1]));
            this.shapes.sphere5.draw(graphics_state,planet4_controls,this.materials.test.override({ color: Color.of(.13,.2,.5,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 1,
                                                                                                    diffusivity: 1}));
            //moon 
            let moon_controls = Mat4.identity();
            moon_controls = planet4_controls;
            moon_controls = moon_controls.times(Mat4.rotation(t*.4,Vec.of(0,1,0)))
                                            .times(Mat4.translation([2,0,0]))
                                            .times(Mat4.rotation(t,Vec.of(0,1,0)));
            this.shapes.sphere6.draw(graphics_state,moon_controls,this.materials.test.override({ color: Color.of(.1,.2,.1,1),
                                                                                                    ambient: 0,
                                                                                                    specularity: 1,
                                                                                                    diffusivity: 1}));
            //camera 
            this.planet_1 = planet1_controls;
            this.planet_2 = planet2_controls;
            this.planet_3 = planet3_controls;
            this.planet_4 = planet4_controls;
            this.moon = moon_controls;

            if(this.attached != undefined)
            {
                let desired = Mat4.inverse(this.attached().times(Mat4.translation([0,0,5])));
                graphics_state.camera_transform = desired.map((x,i) => Vec.from(graphics_state.camera_transform[i]).mix(x,.1));
            }
                                                                                                                                                                                                                                                                                                                                                                                                            
        }
    };


// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
    class Ring_Shader extends Shader {
        // Subclasses of Shader each store and manage a complete GPU program.
        material() {
            // Materials here are minimal, without any settings.
            return {shader: this}
        }

        map_attribute_name_to_buffer_name(name) {
            // The shader will pull single entries out of the vertex arrays, by their data fields'
            // names.  Map those names onto the arrays we'll pull them from.  This determines
            // which kinds of Shapes this Shader is compatible with.  Thanks to this function,
            // Vertex buffers in the GPU can get their pointers matched up with pointers to
            // attribute names in the GPU.  Shapes and Shaders can still be compatible even
            // if some vertex data feilds are unused.
            return {object_space_pos: "positions"}[name];      // Use a simple lookup table.
        }

        // Define how to synchronize our JavaScript's variables to the GPU's:
        update_GPU(g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl) {
            const proj_camera = g_state.projection_transform.times(g_state.camera_transform);
            // Send our matrices to the shader programs:
            gl.uniformMatrix4fv(gpu.model_transform_loc, false, Mat.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(proj_camera.transposed()));
        }

        shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        {
            return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
        }

        vertex_glsl_code()           // ********* VERTEX SHADER *********
        {
            return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
            position = vec4(object_space_pos,1);
            center = vec4(0,0,0,1);
            gl_Position = projection_camera_transform * model_transform * vec4(object_space_pos,1);
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        }

        fragment_glsl_code()           // ********* FRAGMENT SHADER *********
        {
            return `
        void main()
        { 
            gl_FragColor = vec4(.5,.32,.12, sin(25.0 * distance(position,center)));
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        }
    };

window.Grid_Sphere = window.classes.Grid_Sphere =
    class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at
    {
        constructor(rows, columns, texture_range)             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
        {
            super("positions", "normals", "texture_coords");
            // TODO:  Complete the specification of a sphere with lattitude and longitude lines
            //        (Extra Credit Part III)
        }
    };