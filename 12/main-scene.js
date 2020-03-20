window.Final_Project = window.classes.Final_Project =
    class Final_Project extends Scene_Component {
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
                sphere: new Subdivision_Sphere(4)
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
                    test: context.get_instance(Phong_Shader).material(Color.of(1, 1, 0, 1), {ambient: .7}),
                    building: context.get_instance(Phong_Shader).material(Color.of(.23,.23,.23,1), {ambient: .5, texture: context.get_instance("assets/building.jpg",false)}),
                    building2: context.get_instance(Phong_Shader).material(Color.of(.23,.23,.23,1), {ambient: .5, texture: context.get_instance("assets/building-2.jpg",false)}),
                    ground: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/ground.jpg", false)}),
                    road: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/asphalt.jpg", false)}),
                    copBody: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {ambient: .7}),
                    copTop: context.get_instance(Phong_Shader).material(Color.of(.2,.2,.2,1), {ambient: 1}),
                    copLight: context.get_instance(Phong_Shader).material(Color.of(.89,.09,.05,1), {ambient: 1}),
                    glass: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture: context.get_instance("assets/glass.png")}),
                    rubber: context.get_instance(Phong_Shader).material(Color.of(.1,.1,.1,1), {ambient: .9}),
                    menu: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture:context.get_instance("assets/menu.png", true)}),
                    gameover: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture:context.get_instance("assets/gameover.png", true)}),
                    win: context.get_instance(Phong_Shader).material(Color.of(0,0,0,1), {ambient: 1, texture:context.get_instance("assets/win.png", true)})
                };

            this.lights = [new Light(Vec.of(5, -10, 5, 1), Color.of(0, 1, 1, 1), 1000)];

            //general controls
            this.playing = false;
            this.restart = false;
            this.pause = false;

            // music
            //this.menu_music = new Audio()

            this.cop_car = Mat4.identity();
            this.cop_x = 0;
            this.cop_y = 1;
            this.cop_z = 0;
            this.cop_cam = Mat4.look_at(Vec.of(this.cop_x, this.cop_y+30, this.cop_z-50), Vec.of(this.cop_x, this.cop_y, this.cop_z), Vec.of(0,1,0));

            this.move = false;
            this.move_direction = 1;
            this.cop_front_rotation = 0;
            this.cop_angle = 0;
            this.turn_left = false;
            this.turn_right = false;  
            
            this.human_pos = [[-3,37],[-4,18],[-26,-30],[23,27],[16,-36],[3,-37],[4,-18],[39,15],[-43,-10],[-16,36]]; //[x,z]
            this.new_transform = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
            this.colorArr = [Color.of(Math.random(),Math.random(),Math.random(),1),Color.of(Math.random(),Math.random(),Math.random(),1),
                             Color.of(Math.random(),Math.random(),Math.random(),1),Color.of(Math.random(),Math.random(),Math.random(),1),
                             Color.of(Math.random(),Math.random(),Math.random(),1),Color.of(Math.random(),Math.random(),Math.random(),1),
                             Color.of(Math.random(),Math.random(),Math.random(),1),Color.of(Math.random(),Math.random(),Math.random(),1),
                             Color.of(Math.random(),Math.random(),Math.random(),1),Color.of(Math.random(),Math.random(),Math.random(),1)];   

            this.aliveHumans = [true, true, true, true, true, true, true, true, true, true ];

            
            this.collision_distance = (Math.sqrt(29)/2) + (Math.sqrt(1.49)/2);
            this.score = 0;
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            // this.key_triggered_button("Aerial View", ["0"], () => this.attached = () => Mat4.look_at(Vec.of(0, 100, 0), Vec.of(0, 0, 0), Vec.of(0, 0, 1)));
            // this.key_triggered_button("Follow Cop Car", ["1"], () => this.attached = () => this.cop_cam);
            // this.new_line();
            this.key_triggered_button("Move forward", ["i"], () => this.move = true, undefined, () => this.move = false);
            this.key_triggered_button("Move backward", ["k"], () => {this.move = true; this.move_direction = -1;}, undefined, () => {this.move = false; this.move_direction = 1});
            this.new_line();
            this.key_triggered_button("Turn left", ["j"], () => this.turn_left = true, undefined, () => this.turn_left = false);
            this.key_triggered_button("Turn right", ["l"], () => this.turn_right = true, undefined, () => this.turn_right = false);
            this.new_line();
            // this.key_triggered_button("Restart", ["t"], () => this.restart = () => true);
            // this.key_triggered_button("Pause", ["y"], () => this.pause = () => !this.pause);
            this.key_triggered_button("Start Game", ["b"], () => this.playing = () => true);


        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time/1000, dt = graphics_state.animation_delta_time / 1000;

            if (!this.playing) {
                graphics_state.camera_transform = Mat4.look_at(Vec.of(1007, 1008, 978), Vec.of(1007, 1008, 990), Vec.of(0, 1, 0));
                var menu_transform = Mat4.identity()
                                                    .times(Mat4.translation([999,1000,990]))
                                                    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                                    .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
                                                    .times(Mat4.scale([32,1,32]))
                this.shapes.square.draw(graphics_state, menu_transform, this.materials.menu);
            }
            else if (this.hit_building(this.cop_x, this.cop_z))
            {
                graphics_state.camera_transform = Mat4.look_at(Vec.of(1007, 1008, 978), Vec.of(1007, 1008, 990), Vec.of(0, 1, 0));
                var menu_transform = Mat4.identity()
                                                    .times(Mat4.translation([999,1000,990]))
                                                    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                                    .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
                                                    .times(Mat4.scale([32,1,32]))
                this.shapes.square.draw(graphics_state, menu_transform, this.materials.gameover);
                return;
            }
            else if (this.check_win()) {
                graphics_state.camera_transform = Mat4.look_at(Vec.of(1007, 1008, 978), Vec.of(1007, 1008, 990), Vec.of(0, 1, 0));
                var menu_transform = Mat4.identity()
                                                    .times(Mat4.translation([999,1000,990]))
                                                    .times(Mat4.rotation(Math.PI, Vec.of(0,0,1)))
                                                    .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)))
                                                    .times(Mat4.scale([32,1,32]));
                this.shapes.square.draw(graphics_state, menu_transform, this.materials.win);
                return;
            }
            else { 
                graphics_state.camera_transform = this.cop_cam.map((x,i) => Vec.from(graphics_state.camera_transform[i]).mix(x,.5));
            }

            //building 1
            let building1_transform = Mat4.identity();
            building1_transform = building1_transform.times(Mat4.scale([10,5,11]));
            building1_transform = building1_transform.times(Mat4.translation([2.2,1,-.6]));


            //building 2
            let building2_transform = Mat4.identity();
            building2_transform = building2_transform.times(Mat4.scale([10,11,7]));
            building2_transform = building2_transform.times(Mat4.translation([-2.2,1,1.6]));
            
            this.shapes.cube.draw(graphics_state,building1_transform,this.materials.building);
            this.shapes.cube.draw(graphics_state,building2_transform,this.materials.building2);

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

            let human_transform = Mat4.identity();

            if(Math.floor((t%2)*10) == 19 )
            {
                for(var i = 0; i < 10; i += 1)
                {

                        if(this.aliveHumans[i]){
                                this.new_transform[i][0] = ((Math.random()*2)-1);
                                this.new_transform[i][1] = ((Math.random()*2)-1);

                        }
                }
                console.log("working");
            }
            else
            {
                for(var i = 0; i < 10; i += 1)
                {
                        let distance = Math.pow(this.human_pos[i][0]-this.cop_x,2) + Math.pow(this.human_pos[i][1]-this.cop_z,2);
                        distance = Math.sqrt(distance);
                        if(distance <= this.collision_distance)
                        {
                                this.aliveHumans[i] = false;
                                this.score +=1;
                        }

                        if(this.aliveHumans[i])
                        {
                                var x_dist = this.new_transform[i][0];
                                var z_dist = this.new_transform[i][1];
                                var new_x = x_dist + this.human_pos[i][0];
                                var new_z = z_dist+ this.human_pos[i][1];
                                while(new_x >= 47 || new_x <= -47 || new_z >= 47 || new_z <= -47 || //ground boundaries
                                        (( new_x <= 34 && new_x >= 10) && (new_z <= 6.4 && new_z >= -19.6)) || //building 1
                                        (( new_x <= -10 && new_x >= -34) && (new_z <= 20.2 && new_z >= 2.2)) ||//building 2
                                        (this.human_pos.indexOf([new_x,new_z]) != this.human_pos.lastIndexOf([new_x,new_z]))) //other people
                                {
                                       this.new_transform[i][0] = ((Math.random()*1.4)-.7);
                                       this.new_transform[i][1] = ((Math.random()*1.4)-.7);
                                       x_dist = this.new_transform[i][0];
                                       z_dist = this.new_transform[i][1];
                                       new_x = x_dist + this.human_pos[i][0];
                                       new_z = z_dist + this.human_pos[i][1];                  
                                }
                                this.human_pos[i][0] = new_x;
                                this.human_pos[i][1] = new_z;                               
                        }

                }

            }
            
            for(var j = 0; j < 10; j+= 1)
            {
                    if(this.aliveHumans[j])
                    {
                            human_transform = human_transform.times(Mat4.translation([this.human_pos[j][0],0,this.human_pos[j][1]]));
                            this.drawHuman(graphics_state,human_transform,this.colorArr[j]);
                    }
                    human_transform = Mat4.identity();
            }

            // Cop Car
            var cop_velocity;
            const max_turning_angle = 65*Math.PI/180;

            if (this.turn_left) {
                if (this.cop_front_rotation < max_turning_angle)
                    this.cop_front_rotation += Math.PI*dt;
            }
            else if (this.turn_right) {
                if (this.cop_front_rotation > -max_turning_angle)
                    this.cop_front_rotation -= Math.PI*dt;
            }

            let cop_car = Mat4.identity().times(Mat4.translation([this.cop_x, 1, this.cop_z]));
            var x_delta = 0;
            var z_delta = 0;

            if (this.move) {
                cop_velocity = 10*this.move_direction*dt;
                x_delta = cop_velocity*Math.sin(this.cop_angle);
                z_delta = cop_velocity*Math.cos(this.cop_angle);

                this.cop_angle += this.move_direction*this.cop_front_rotation/50;
            }
            else {
                cop_velocity = 0;
            }
            
            var x_camera_new = 50*Math.sin(this.cop_angle);
            var z_camera_new = 50*Math.cos(this.cop_angle);

            this.cop_x += x_delta;
            this.cop_z += z_delta;
            cop_car = cop_car.times(Mat4.rotation(this.cop_angle, Vec.of(0,1,0)));

            // Recalculate Cop Camera Coords
            this.cop_cam = Mat4.look_at(Vec.of(this.cop_x-x_camera_new, this.cop_y+30, this.cop_z-z_camera_new), Vec.of(this.cop_x, this.cop_y, this.cop_z), Vec.of(0,1,0));

            this.drawCopCar(graphics_state, cop_car, cop_velocity);            
            if (this.attached != null) {
                graphics_state.camera_transform = this.attached();
            }
        }

        drawCopCar(graphics_state, initial_position, v) {
            // Car Body
            let cop_body = initial_position;
            cop_body = cop_body.times(Mat4.translation([0, 2, 0]))
                               .times(Mat4.scale([2, 1, 5]));

            let cop_front = cop_body;
            cop_front = cop_body.times(Mat4.translation([0, 0, 0.75]))
                                .times(Mat4.scale([1, 1, 0.25]));
            this.shapes.cube.draw(graphics_state, cop_front, this.materials.copBody.override({color: this.copBlack}));

            let cop_back = cop_body;
            cop_back = cop_body.times(Mat4.translation([0, 0, -0.75]))
                                .times(Mat4.scale([1, 1, 0.25]));
            this.shapes.cube.draw(graphics_state, cop_back, this.materials.copBody.override({color: this.copBlack}));

            cop_body = cop_body.times(Mat4.translation([0, 1, 0]))
                               .times(Mat4.scale([1, 2, 0.5]));

            this.shapes.cube.draw(graphics_state, cop_body, this.materials.copBody);

            // Windows
            // Front/Back Windshield
            let window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([0,0.5,0.95]))
                                               .times(Mat4.scale([0.9,0.4,0.1]));

            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);
            
            window_transform = window_transform.times(Mat4.translation([0,0,-19]));
            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);

            // Side Windows
            window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([0.95, 0.5, 0.5]))
                                               .times(Mat4.scale([0.1, 0.4, 0.4]));
            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);
            window_transform = window_transform.times(Mat4.translation([0, 0, -2.5]));
            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);

            window_transform = cop_body;
            window_transform = window_transform.times(Mat4.translation([-0.95, 0.5, 0.5]))
                                               .times(Mat4.scale([0.1, 0.4, 0.4]));
            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);
            window_transform = window_transform.times(Mat4.translation([0, 0, -2.5]));
            this.shapes.cube.draw(graphics_state, window_transform, this.materials.glass);

            // Top Part of Cop Car
            let cop_top = initial_position;
            cop_top = cop_top.times(Mat4.translation([0,5,0]));

            let cop_red_light = cop_top.times(Mat4.scale([.8,0.25,.75]))
                                       .times(Mat4.translation([1.2,.8,0]));
            this.shapes.cube.draw(graphics_state, cop_red_light, this.materials.copLight.override({color: this.copRed}));

            let cop_blue_light = cop_top.times(Mat4.scale([.8,0.25,.75]))
                                       .times(Mat4.translation([-1.2,.8,0]));
            this.shapes.cube.draw(graphics_state, cop_blue_light, this.materials.copLight.override({color: this.copBlue}));

            cop_top = cop_top.times(Mat4.scale([0.2, .8, 1]));
            this.shapes.cube.draw(graphics_state, cop_top, this.materials.copTop);

            // Wheels
            let wheel = initial_position;
            let front_wheel_rotation = Mat4.identity().times(Mat4.rotation(this.cop_front_rotation, Vec.of(0,1,0)));

            // Front Wheels
            wheel = wheel.times(Mat4.translation([2,1,2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)));

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*v/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, wheel.times(front_wheel_rotation), this.materials.rubber);

            wheel = initial_position;
            wheel = wheel.times(Mat4.translation([-2,1,2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*v/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, wheel.times(front_wheel_rotation), this.materials.rubber);

            // Back Wheels
            wheel = initial_position;
            wheel = wheel.times(Mat4.translation([-2,1,-2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*v/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, wheel, this.materials.rubber);

            wheel = initial_position;
            wheel = wheel.times(Mat4.translation([2,1,-2]))
                         .times(Mat4.scale([0.4,0.4,0.4]))
                         .times(Mat4.rotation(Math.PI/2, Vec.of(0,1,0)))

            if (this.move)
                wheel = wheel.times(Mat4.rotation(this.move_direction*Math.PI*v/4, Vec.of(0,0,1)));

            this.shapes.torus.draw(graphics_state, wheel, this.materials.rubber);
        }

        drawHuman(graphics_state, initial_position,color)
        {
                let human_body = initial_position;
                human_body = human_body.times(Mat4.scale([1,2,1]));
                human_body = human_body.times(Mat4.translation([.65,1.6,0])) .times(Mat4.scale([.5,.5,.5]));
                
                let head = initial_position;
                head = head.times(Mat4.translation([0,5,0]))
                        .times(Mat4.scale([1.3,1.3,1.3]))
                        .times(Mat4.translation([.5,-.13,0]))
                        .times(Mat4.scale([.5,.5,.5]));

                let arm1 = initial_position;
                arm1 = arm1.times(Mat4.scale([.3,1.3,.3]))
                           .times(Mat4.translation([4.4,2.6,0])) 
                           .times(Mat4.scale([.5,.5,.5]));

                let arm2 = arm1;
                arm2 = arm2.times(Mat4.translation([-8.8,0,0]));

                let leg1 = arm1;
                leg1 = leg1.times(Mat4.translation([-1.9,-2.8,0])).times(Mat4.scale([1,1.2,1]));

                let leg2 = arm2;
                leg2 = leg2.times(Mat4.translation([1.9,-2.8,0])).times(Mat4.scale([1,1.2,1]));

                this.shapes.cube.draw(graphics_state, human_body, this.materials.test.override({color: color}));
                this.shapes.sphere.draw(graphics_state, head, this.materials.test);

                
                this.shapes.cube.draw(graphics_state,arm1, this.materials.test);
                this.shapes.cube.draw(graphics_state,arm2, this.materials.test);
                this.shapes.cube.draw(graphics_state,leg1, this.materials.test);
                this.shapes.cube.draw(graphics_state,leg2, this.materials.test);
        }

        hit_building(x, z) {
            if (x >= 45 || x <= -45 || z >= 45 || z <= -45 || //ground boundaries
            (( x <= 34 && x >= 10) && (z <= 6.4 && z >= -19.6)) || //building 1
            (( x <= -10 && x >= -34) && (z <= 20.2 && z >= 2.2))) //building 2
            {
                return true;
            }
            return false;
        }

        check_win() {
            for (var i = 0; i < this.aliveHumans.length; i++) {
                if (this.aliveHumans[i] == true)
                    return false;
            }
            return true;
        }

    };

