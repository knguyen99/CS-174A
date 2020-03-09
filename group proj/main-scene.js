window.Assignment_Three_Scene = window.classes.Assignment_Three_Scene =
    class Assignment_Three_Scene extends Scene_Component {
        constructor(context, control_box)
        {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 50, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 1));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                square: new Square(),
                cube: new Cube(),
                car: new Shape_From_File( "assets/Small car.obj" ),
                teapot: new Shape_From_File( "assets/teapot.obj" ),
                cop: new Shape_From_File("assets/cop.obj")
            };

            shapes.square.texture_coords = shapes.square.texture_coords.map( x => x.times(4) );
            this.submit_shapes(context, shapes);

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
                    cop: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/cop.png")}),
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("Aerial View", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("Follow Cop Car", ["1"], () => this.attached = () => this.cop_cam);
            this.key_triggered_button("Follow Bad Car", ["2"], () => this.attached = () => this.bad_cam);
            this.new_line();
            this.key_triggered_button("Temporary Camera", ["3"], () => this.attached = () => this.temp_camera);
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
            car_transform = car_transform.times(Mat4.translation([0, 5, 0]));
            this.shapes.car.draw(graphics_state, car_transform, this.materials.car);

            // Cop Car
            let cop_transform = Mat4.identity();
            cop_transform = cop_transform.times(Mat4.translation([5, 5, 5]));
            this.shapes.cop.draw(graphics_state, cop_transform, this.materials.cop);
        }
    };