window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 20, -20), Vec.of(0, 5, 0), Vec.of(0, 1, 0));
            this.initial_camera_location = context.globals.graphics_state.camera_transform;

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                square: new Square(),
                cube: new Cube(),
                torus: new Torus(15, 15),
                car: new Shape_From_File( "assets/Small car.obj" ),
                teapot: new Shape_From_File( "assets/teapot.obj" ),
                cop: new Shape_From_File("assets/cop.obj")
            };

            shapes.square.texture_coords = shapes.square.texture_coords.map( x => x.times(4) );
            this.submit_shapes(context, shapes);
            this.copRed = Color.of(.89,.09,.05,0.8);
            this.copBlue = Color.of(0,.24,1,0.8);
            this.copBlack = Color.of(.2,.2,.2,1);
            this.copWhite = Color.of(1,1,1,1);
            // Make some Material objects available to you:
            this.materials =
                {
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .2}),
                    building: context.get_instance(Phong_Shader).material(Color.of(.23,.23,.23,1), {ambient: .5, texture: context.get_instance("assets/building.jpg",false)}),
                    //building2: context.get_instance(Phong_Shader).material(Color.of(.23,.23,.23,1), {ambient: .5, texture: context.get_instance("assets/building2.jpg",false)}),
                    ground: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/ground.jpg", false)}),
                    road: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/asphalt.jpg", false)}),
                    teapot: context.get_instance(Phong_Shader).material(Color.of( .5,.5,.5,1 ), { ambient: .3, diffusivity: .5, specularity: .5, texture: context.get_instance("assets/stars.png", false) }),
                    car: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/carbodyD.png")}),
                    copBody: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: .7}),
                    copTop: context.get_instance(Phong_Shader).material(Color.of(.2,.2,.2,1), {ambient: 1}),
                    copLight: context.get_instance(Phong_Shader).material(Color.of(.89,.09,.05,1), {ambient: 1}),
                    glass: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/glass.png")}),
                    rubber: context.get_instance(Phong_Shader).material(Color.of(.1,.1,.1,1), {ambient: .9})
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];

            this.cop_x = 0;
            this.cop_y = 1;
            this.cop_z = 0;

            this.move = false;
            this.move_direction = 1;
            this.turn_right = false;
            this.turn_left = false;
            this.cop_car_rotation = 0;
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("Aerial View", ["0"], () => this.attached = () => null);
            this.key_triggered_button("Follow Cop Car", ["1"], () => this.attached = () => this.cop_cam);
            this.key_triggered_button("Follow Bad Car", ["2"], () => this.attached = () => this.bad_cam);
            this.key_triggered_button("Temporary Camera", ["3"], () => this.attached = () => this.temp_camera);
            this.new_line();
            this.key_triggered_button("Move forward", ["i"], () => this.move = true, undefined, () => this.move = false);
            this.key_triggered_button("Move backward", ["k"], () => {this.move = true; this.move_direction = -1;}, undefined, () => {this.move = false; this.move_direction = 1});
            this.key_triggered_button("Turn left", ["j"], () => this.turn_left = true, undefined, () => this.turn_left = false);
            this.key_triggered_button("Turn right", ["l"], () => this.turn_right = true, undefined, () => this.turn_right = false);
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

            //building 1
            let building1_transform = Mat4.identity();
            building1_transform = building1_transform.times(Mat4.scale([10,5,11]));
            building1_transform = building1_transform.times(Mat4.translation([2.2,1,-.6]));


            //building 2
            let building2_transform = Mat4.identity();
            building2_transform = building2_transform.times(Mat4.scale([10,11,7]));
            building2_transform = building2_transform.times(Mat4.translation([-2.2,1,1.6]));
            
            this.shapes.cube.draw(graphics_state,building1_transform,this.materials.building);
            this.shapes.cube.draw(graphics_state,building2_transform,this.materials.building);

            // Ground
            let world_transform = Mat4.identity();
            world_transform = world_transform.times(Mat4.scale([50, 10, 50]));
            this.shapes.square.draw(graphics_state, world_transform, this.materials.ground);

            // Roads
            let road_transform = Mat4.identity();
            road_transform = road_transform.times(Mat4.scale([10, 0.5, 50])).times(Mat4.translation([0,1,0]));
            this.shapes.cube.draw(graphics_state, road_transform, this.materials.road);

            road_transform = Mat4.identity();
            road_transform = road_transform.times(Mat4.translation([0, 0, 25]))
                                           .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                                           .times(Mat4.scale([5, 0.5, 50]))
                                           .times(Mat4.translation([0,1,0]));

            this.shapes.cube.draw(graphics_state, road_transform, this.materials.road);

            road_transform = Mat4.identity();
            road_transform = road_transform.times(Mat4.translation([0, 0, -25]))
                                           .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                                           .times(Mat4.scale([5, 0.5, 50]))
                                           .times(Mat4.translation([0,1,0]));

            this.shapes.cube.draw(graphics_state, road_transform, this.materials.road);

            // Bad Car
            let car_transform = Mat4.identity();
            car_transform = car_transform.times(Mat4.translation([0, 2.5, 0])).times(Mat4.scale([4, 4, 4]));
            //this.shapes.car.draw(graphics_state, car_transform, this.materials.car);

            // Cop Car
            var cop_velocity;
            if (this.move) {
                cop_velocity = 5*this.move_direction*dt;
                this.cop_z += cop_velocity;
            }
            else {
                cop_velocity = 0;
            }

            let cop_car = Mat4.identity().times(Mat4.translation([0,1,this.cop_z]));
            this.cop_cam = Mat4.look_at(Vec.of(this.cop_x, this.cop_y+20, this.cop_z-40), Vec.of(this.cop_x, this.cop_y, this.cop_z), Vec.of(0,1,0));

            this.drawCopCar(graphics_state, cop_car, cop_velocity);            

            if (this.attached != null) {
                graphics_state.camera_transform = this.attached();
            }
        }

        drawCopCar(graphics_state, initial_position, t) {
            // Car Body
            let cop_body = Mat4.identity();
            cop_body = cop_body.times(Mat4.translation([0, 2, 0]))
                               .times(Mat4.scale([2, 1, 5]));
            
            this.shapes.cube.draw(graphics_state, initial_position.times(cop_body), this.materials.copBody.override({color: this.copBlack}));
            cop_body = cop_body.times(Mat4.translation([0, 1, 0]))
                               .times(Mat4.scale([1, 2, 0.5]));

            this.shapes.cube.draw(graphics_state, initial_position.times(cop_body), this.materials.copBody);

            // Windows
            // Front/Back Windshield
            let window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([0,0.5,0.95]))
                                               .times(Mat4.scale([0.9,0.4,0.1]));

            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);
            
            window_transform = window_transform.times(Mat4.translation([0,0,-19]));
            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);

            // Side Windows
            window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([0.95, 0.5, 0.5]))
                                               .times(Mat4.scale([0.1, 0.4, 0.4]));
            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);
            window_transform = window_transform.times(Mat4.translation([0, 0, -2.5]));
            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);

            window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([-0.95, 0.5, 0.5]))
                                               .times(Mat4.scale([0.1, 0.4, 0.4]));
            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);
            window_transform = window_transform.times(Mat4.translation([0, 0, -2.5]));
            this.shapes.cube.draw(graphics_state, initial_position.times(window_transform), this.materials.glass);

            // Top Part of Cop Car
            let cop_top = Mat4.identity();
            cop_top = cop_top.times(Mat4.translation([0,5,0]));

            let cop_red_light = cop_top.times(Mat4.scale([.8,0.25,.75]))
                                       .times(Mat4.translation([1.2,.8,0]));
            this.shapes.cube.draw(graphics_state, initial_position.times(cop_red_light), this.materials.copLight.override({color: this.copRed}));

            let cop_blue_light = cop_top.times(Mat4.scale([.8,0.25,.75]))
                                       .times(Mat4.translation([-1.2,.8,0]));
            this.shapes.cube.draw(graphics_state, initial_position.times(cop_blue_light), this.materials.copLight.override({color: this.copBlue}));

            cop_top = cop_top.times(Mat4.scale([0.2, .8, 1]));
            this.shapes.cube.draw(graphics_state, initial_position.times(cop_top), this.materials.copTop);

            // Wheels
            let wheel = Mat4.identity();

            // Front Wheels
            wheel = wheel.times(Mat4.translation([2,1,2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*t/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, initial_position.times(wheel), this.materials.rubber);

            wheel = Mat4.identity();
            wheel = wheel.times(Mat4.translation([-2,1,2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                         .times(Mat4.rotation(Math.PI*t/4, Vec.of(0,0,1)));

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*t/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, initial_position.times(wheel), this.materials.rubber);

            // Back Wheels
            wheel = Mat4.identity();
            wheel = wheel.times(Mat4.translation([-2,1,-2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                         .times(Mat4.rotation(Math.PI*t/4, Vec.of(0,0,1)));

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*t/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, initial_position.times(wheel), this.materials.rubber);

            wheel = Mat4.identity();
            wheel = wheel.times(Mat4.translation([2,1,-2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))
                         .times(Mat4.rotation(Math.PI*t/4, Vec.of(0,0,1)));

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*t/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, initial_position.times(wheel), this.materials.rubber);
        }
    };