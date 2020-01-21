/* @todo(Matt): 
     -  Input verification 
     -  Proper resizing
     -  Rain density
*/ 

function main() 
{
    let context = null;
    let active_columns = [];
    
    let app = 
    {
        settings_is_open: false,
        is_stopped: false,
        font_size: 12,
        rain_color: "#00FF00",
        background_color: "#000000",
        rain_density: 1,
        rain_speed: 33,
        // character_set: "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑",
        character_set: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    };

    let settings = 
    {
        font_size: document.getElementById("font_size"),
        rain_color: document.getElementById("rain_color"),
        background_color: document.getElementById("background_color"),
        // rain_density: document.getElementById("rain_density"),
        rain_speed: document.getElementById("rain_speed"),
        character_set: document.getElementById("character_set"),
        update: document.getElementById("update_settings"),
    };

    window.onkeydown = e => 
    {
        if ((e.which == 27) || (e.which == 13)) 
        {
            app.settings_is_open ? close_settings() : open_settings();
        }
        else if (e.which == 112)
        {
            app.is_stopped ? begin_interval() : stop_interval();
        }
    }

    function open_settings() 
    {
        hide_settings_notifier();
        app.settings_is_open = true;
        document.getElementById("settings").classList.remove("hidden");
    }

    function close_settings() 
    {
        app.settings_is_open = false;
        document.getElementById("settings").classList.add("hidden");
    }

    function update_app_settings()
    {
        if (app.font_size != parseInt(settings.font_size.value)) 
        {
            app.font_size = parseInt(settings.font_size.value);
            context.font = `${app.font_size}px ${app.font}`;
            set_columns();
        }

        app.rain_color = "#" + settings.rain_color.value;
        app.background_color = "#" + settings.background_color.value;
        // app.rain_density = settings.rain_density.value;
        app.rain_speed = parseInt(settings.rain_speed.value) * -1;
        app.character_set = settings.character_set.value;

        restart_interval();
    }

    function bind_dom_elements() 
    {
        settings.font_size.value = app.font_size;
        settings.rain_color.value = app.rain_color.substring(1);
        settings.background_color.value = app.background_color.substring(1);
        // settings.rain_density.value = app.rain_density;
        settings.rain_speed.value = parseInt(app.rain_speed) * -1;
        settings.character_set.value = app.character_set;

        //@todo(Matt): Fix this redundancy
        settings.font_size.onkeydown = e => { if (e.which === 13) update_app_settings(); };
        settings.rain_color.onkeydown = e => { if (e.which === 13) update_app_settings(); };
        settings.background_color.onkeydown = e => { if (e.which === 13) update_app_settings(); };
        settings.character_set.onkeydown = e => { if (e.which === 13) update_app_settings(); };


        settings.update.onclick = update_app_settings;
    }

    function base_16_to_10(hex)
    {
        let result = 0;
        let digits = hex.split("");
        
        for (let i = 0; i < digits.length; i++) 
        {
            result += Math.pow(10, i) * parseInt(`0x${digits[i]}`);
        }

        return result;
    }

    function hex_to_rgba(hex)
    {
        let r, g, b;
        console.log(hex.length);

        if (hex.length === 7)
        {
            r = base_16_to_10(hex.substring(1, 3));
            g = base_16_to_10(hex.substring(3, 5));
            b = base_16_to_10(hex.substring(5, 7));
        }
        else if (hex.length === 4)
        {
            r = base_16_to_10(hex.substring(1, 2) + hex.substring(1, 2));
            g = base_16_to_10(hex.substring(2, 3) + hex.substring(2, 3));
            b = base_16_to_10(hex.substring(3, 4) + hex.substring(3, 4));
        }
        else 
        {
            console.error("Given an invalid hex.");
            r = 0;
            g = 0;
            b = 0;
        }

        return `rgba(${r}, ${g}, ${b}, 0.05)`
    }

    function clear_canvas() 
    {
        context.fillStyle = hex_to_rgba(app.background_color);
        context.fillRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
    }

    function get_random_character()
    {
        return app.character_set.charAt(Math.floor(Math.random() * app.character_set.length));
    }
    
    function init_canvas() 
    {
        let canvas_element = document.createElement("canvas");
        canvas_element.height = window.innerHeight;
        canvas_element.width = window.innerWidth;
        document.getElementById("page-container").append(canvas_element);
        let the_context = canvas_element.getContext("2d");
        the_context.font = `${app.font_size}px ${app.font}`;

        return the_context;
    }

    function render()
    {
        clear_canvas();
        //@note(Matt): Have to set fillstyle again here because I set it within clear_canvas
        context.fillStyle = app.rain_color;

        for (let i = 0; i < active_columns.length; i++)
        {
            context.fillText(get_random_character(), i * app.font_size, active_columns[i] * app.font_size);

            if (((active_columns[i] * app.font_size) > context.canvas.clientHeight) && Math.random() > 0.98)
            {
                active_columns[i] = 0;
            }

            active_columns[i]++;
        }
    }

    function set_columns() 
    {
        active_columns = [];
        app.columns = context.canvas.clientWidth / app.font_size;

        for (let i = 0; i < app.columns; i++)
        {
            active_columns[i] = 1;
        }
    }

    function begin_interval() 
    {
        app.interval_id = setInterval(render, app.rain_speed);
        app.is_stopped = false;
    }

    function stop_interval() 
    {
        clearInterval(app.interval_id);
        app.is_stopped = true;
        app.interval_id = null;
    }

    function restart_interval()
    {
        stop_interval();
        begin_interval();
    }

    function hide_settings_notifier() 
    {
        let settings_notifier = document.getElementById("settings-notifier");

        if (settings_notifier)
        {
            settings_notifier.classList.add("hidden");
        }
    }

    function start()
    {
        context = init_canvas();
        bind_dom_elements();

        if (!context) 
        {
            console.error("[FATAL] Failed to initialize 2d canvas context.");
            return;
        }

        set_columns();
        begin_interval();

        setTimeout(() => {
            hide_settings_notifier();
        }, 5000);
    }
    
    window.onresize = () => 
    {
        context.canvas.width = Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);
        context.canvas.height = Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]);
        set_columns();
    }

    start();
}

main();